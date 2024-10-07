#!/bin/bash

# Function to create JSON structure
create_json_structure() {
    local dir=$1
    local first=true

    echo "{"

    for item in "$dir"/*; do
        if [ "$first" = true ]; then
            first=false
        else
            echo ","
        fi

        if [ -d "$item" ]; then
            echo "  \"$(basename "$item")\": $(create_json_structure "$item")"
        elif [ -f "$item" ]; then
            echo "  \"$(basename "$item")\": null"
        fi
    done

    echo "}"
}

# Create the sitemap.json file
echo "{" >sitemap.json
echo "  \"root\": {" >>sitemap.json

# List root files
first=true
for item in *; do
    if [ -f "$item" ]; then
        if [ "$first" = true ]; then
            first=false
        else
            echo "," >>sitemap.json
        fi
        echo "    \"$item\": null" >>sitemap.json
    fi
done

# List contents of app, prisma, and public directories
for dir in app prisma public; do
    if [ -d "$dir" ]; then
        echo "," >>sitemap.json
        echo "    \"$dir\": $(create_json_structure "$dir")" >>sitemap.json
    fi
done

echo "  }" >>sitemap.json
echo "}" >>sitemap.json
