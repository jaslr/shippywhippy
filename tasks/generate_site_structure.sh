#!/bin/bash

# Create or overwrite the sitemap.md file
echo "# Site Structure" >sitemap.md
echo "" >>sitemap.md

# Function to list files and directories
list_contents() {
    local dir=$1
    local prefix=$2

    for item in "$dir"/*; do
        if [ -d "$item" ]; then
            echo "${prefix}- $(basename "$item")/" >>sitemap.md
            list_contents "$item" "  $prefix"
        elif [ -f "$item" ]; then
            echo "${prefix}- $(basename "$item")" >>sitemap.md
        fi
    done
}

# List root files
echo "## Root" >>sitemap.md
for item in *; do
    if [ -f "$item" ]; then
        echo "- $item" >>sitemap.md
    fi
done

# List contents of app, prisma, and public directories
for dir in app prisma public; do
    if [ -d "$dir" ]; then
        echo "" >>sitemap.md
        echo "## $dir" >>sitemap.md
        list_contents "$dir" ""
    fi
done
