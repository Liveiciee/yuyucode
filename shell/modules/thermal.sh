# ================================================
# Thermal Manager - Context-Aware Performance
# ================================================

_yuyu_get_cpu_temp() {
    for thermal in /sys/class/thermal/thermal_zone*/temp; do
        if [[ -f "$thermal" ]]; then
            local temp=$(cat "$thermal" 2>/dev/null)
            echo "$((temp / 1000))"
            return
        fi
    done
    # Fallback for Termux
    if command -v termux-battery-status >/dev/null 2>&1; then
        echo "N/A (use termux-battery-status)"
    else
        echo "N/A"
    fi
}

_yuyu_get_battery_temp() {
    if [[ "${YUYU_IS_TERMUX:-false}" == "true" ]] && command -v termux-battery-status >/dev/null 2>&1; then
        termux-battery-status 2>/dev/null | grep -o '"temperature":[0-9]*' | cut -d: -f2 | awk '{print $1/10}' || echo "N/A"
    elif [[ -f "/sys/class/power_supply/battery/temp" ]]; then
        local temp=$(cat /sys/class/power_supply/battery/temp 2>/dev/null)
        echo "$((temp / 1000))"
    else
        echo "N/A"
    fi
}

_yuyu_set_power_profile() {
    local cpu_temp=$(_yuyu_get_cpu_temp)
    local bat_temp=$(_yuyu_get_battery_temp)
    
    # Convert to numbers if possible
    if [[ "$cpu_temp" =~ ^[0-9]+$ ]] && [[ "$bat_temp" =~ ^[0-9]+$ ]]; then
        if [[ $cpu_temp -gt 70 ]] || [[ $bat_temp -gt 45 ]]; then
            export YUYU_POWER_PROFILE="hot"
            export NODE_MAX_HEAP=256
            export NODE_OPTIONS="--max-old-space-size=256 --max-semi-space-size=8"
            export YUYU_THERMAL_WARNING=1
        elif [[ $cpu_temp -gt 60 ]] || [[ $bat_temp -gt 40 ]]; then
            export YUYU_POWER_PROFILE="warm"
            export NODE_MAX_HEAP=384
            export NODE_OPTIONS="--max-old-space-size=384 --max-semi-space-size=12"
            export YUYU_THERMAL_WARNING=0
        else
            export YUYU_POWER_PROFILE="cool"
            export NODE_MAX_HEAP=512
            export NODE_OPTIONS="--max-old-space-size=512 --max-semi-space-size=16"
            export YUYU_THERMAL_WARNING=0
        fi
    else
        export YUYU_POWER_PROFILE="cool"
    fi
}

# Smart wrapper untuk perintah berat
y_build_smart() {
    if [[ "${YUYU_POWER_PROFILE}" == "hot" ]]; then
        _neko_warn "Device is hot, building with reduced resources..."
        npm run build -- --max-old-space-size=256
    else
        npm run build "$@"
    fi
}

# Alias
ytemp() {
    echo "CPU: $(_yuyu_get_cpu_temp)°C"
    echo "Battery: $(_yuyu_get_battery_temp)°C"
}

yprofile() {
    echo "Power Profile: ${YUYU_POWER_PROFILE:-cool}"
    echo "Node Heap: ${NODE_MAX_HEAP:-512}MB"
    echo "Node Options: ${NODE_OPTIONS}"
}

# Initialize
_yuyu_set_power_profile
