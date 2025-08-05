#!/bin/bash

aws s3 sync . s3://me.cmdr2.org/carbon --exclude ".git/*" --exclude "LICENSE" --exclude "README.md" --exclude "*.sh" --acl public-read
