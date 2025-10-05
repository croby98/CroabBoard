#!/bin/bash
# Wrapper script - calls the actual start script in docker/scripts/
cd "$(dirname "$0")"
./docker/scripts/start.sh "$@"
