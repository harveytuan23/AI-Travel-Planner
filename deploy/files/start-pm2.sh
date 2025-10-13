#!/bin/bash
cd /opt/ai-travel-planner/backend
export NODE_ENV=production
pm2 start pm2.config.js
pm2 save
pm2 startup
