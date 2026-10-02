#!/bin/bash
cd "$(dirname "$0")"
chmod +x install_from_zero.sh
./install_from_zero.sh
echo
read -r -p "Pulsa Enter para cerrar..." _
