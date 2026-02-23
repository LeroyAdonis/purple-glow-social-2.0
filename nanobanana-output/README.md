# Nano Banana Output Directory

This directory contains AI-generated images created by the Gemini CLI nanobanana extension.

## Structure

`
nanobanana-output/
├── instagram_*.png    # Instagram posts (1080x1080)
├── facebook_*.png     # Facebook posts (1200x630)
├── twitter_*.png      # Twitter posts (1200x675)
└── linkedin_*.png     # LinkedIn posts (1200x627)
`

## File Naming Convention

`
{platform}_{topic_slug}_{timestamp}.png
`

Example:
- instagram_coffee_culture_1705920000000.png
- linkedin_tech_innovation_1705920001000.png

## Cleanup

Old generated images should be periodically cleaned up to save disk space.
