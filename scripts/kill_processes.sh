#!/bin/bash

kill_process() {
    if pgrep -f "$1" >/dev/null; then
        pkill -f "$1" && echo "Killed $1 process"
    else
        echo "No $1 process found"
    fi
}

kill_process 'npm run dev'
kill_process 'npx prisma studio'
kill_process 'npm run compodoc'
