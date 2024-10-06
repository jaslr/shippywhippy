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

# Wait a moment to ensure processes are fully terminated
sleep 2

# Close any VS Code terminals running these processes
for pid in $(pgrep -f "Code.*npm run dev"); do
    kill $pid
done

for pid in $(pgrep -f "Code.*npx prisma studio"); do
    kill $pid
done

for pid in $(pgrep -f "Code.*npm run compodoc"); do
    kill $pid
done

echo "All relevant processes and terminals have been closed"
