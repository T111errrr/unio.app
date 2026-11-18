#!/bin/sh
# Hemat kuota Vercel Hobby (100 build/hari): hanya cabang `main` dan `preview` yang dibangun.
# Aturan Vercel: exit 1 = lanjut build, exit 0 = lewati build.
if [ "$VERCEL_GIT_COMMIT_REF" = "main" ] || [ "$VERCEL_GIT_COMMIT_REF" = "preview" ]; then
  exit 1
fi
exit 0
