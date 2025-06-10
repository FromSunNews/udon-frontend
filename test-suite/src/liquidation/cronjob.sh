#!/bin/bash

# Environment setup
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # Load NVM

# Change to project directory
cd "$(dirname "$0")/../.."

# Record start time
START_TIME=$(date +"%Y-%m-%d %H:%M:%S")
LOG_FILE="logs/liquidation_$(date +"%Y%m%d_%H%M%S").log"

# Ensure log directory exists
mkdir -p logs

# Log header
echo "=== Liquidation Bot Started at $START_TIME ===" | tee -a "$LOG_FILE"

# Run the liquidation script
echo "Running liquidation script..." | tee -a "$LOG_FILE"
node --unhandled-rejections=strict dist/liquidation/script.js 2>&1 | tee -a "$LOG_FILE"

# Record end time
END_TIME=$(date +"%Y-%m-%d %H:%M:%S")
echo "=== Liquidation Bot Completed at $END_TIME ===" | tee -a "$LOG_FILE"

# Add empty line for better readability in logs
echo "" | tee -a "$LOG_FILE"
