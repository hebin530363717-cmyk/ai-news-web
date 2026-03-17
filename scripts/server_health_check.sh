#!/bin/bash

# 服务器自动巡检脚本
# 生成报告并发送到飞书群

# 飞书群 ID (当前群)
FEISHU_GROUP="chat:oc_36f5dd91d330f5c391774b779e5908f4"

REPORT_FILE="/tmp/server_health_report_$(date +%Y%m%d_%H%M%S).txt"

# 开始生成报告
{
echo "🖥️ *服务器健康巡检报告*"
echo "📅 $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "【📊 系统状态】"
uptime | awk -v FS=', ' '{print "  负载: " $NF}'
echo ""
echo "【💾 内存使用】"
free -h | awk 'NR==1{print "  " $0} NR==2{print "  " $0}'
echo ""
echo "【💿 磁盘使用】"
df -h | grep -E '^/dev' | awk '{print "  " $1 ": " $3 "/" $2 " (" $5 ")"}'
echo ""
echo "【🐳 Docker 状态】"
DOCKER_STATUS=$(systemctl is-active docker 2>/dev/null)
if [ "$DOCKER_STATUS" = "active" ]; then
    echo "  ✅ 运行中"
else
    echo "  ❌ 已停止"
fi
echo ""
echo "【🚪 OpenClaw Gateway】"
if systemctl is-active openclaw-gateway &>/dev/null; then
    echo "  ✅ 运行正常"
else
    echo "  ⚠️ 需要检查"
fi
echo ""
echo "【🛡️ 安全监控】"
BANNED=$(fail2ban-client status sshd 2>/dev/null | grep "Currently banned" | awk '{print $NF}')
TOTAL_BAN=$(fail2ban-client status sshd 2>/dev/null | grep "Total banned" | awk '{print $NF}')
echo "  SSH 防御: $([ -n "$BANNED" ] && echo "$BANNED" || echo "0") 个IP被Ban (累计: ${TOTAL_BAN:-0})"
echo ""
echo "【🚫 当前被Ban IP】"
BANNED_IPS=$(fail2ban-client status sshd 2>/dev/null | grep "Banned IP list" | awk -F': ' '{print $2}')
if [ -n "$BANNED_IPS" ]; then
    echo "  $BANNED_IPS"
else
    echo "  (无)"
fi
echo ""
echo "✅ 巡检完成"

} > "$REPORT_FILE"

# 读取报告内容
REPORT_CONTENT=$(cat "$REPORT_FILE")

# 发送报告到飞书群
openclaw message send \
    --channel feishu \
    --target "$FEISHU_GROUP" \
    --message "$REPORT_CONTENT" \
    --verbose 2>&1

# 清理旧报告（保留最近10份）
ls -1 /tmp/server_health_report_*.txt 2>/dev/null | head -n -10 | xargs rm -f 2>/dev/null
