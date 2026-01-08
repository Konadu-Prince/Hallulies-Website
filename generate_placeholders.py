from PIL import Image, ImageDraw, ImageFont
import os

# Create images directory if it doesn't exist
os.makedirs('images', exist_ok=True)

def create_placeholder_image(width, height, filename, text=None):
    # Create a new image with a background color
    img = Image.new('RGB', (width, height), color=(73, 109, 137))
    
    # Create a draw object
    d = ImageDraw.Draw(img)
    
    # Add text if provided
    if text:
        # Try to use default font, fallback to basic if not available
        try:
            font = ImageFont.truetype("arial.ttf", 36)
        except:
            font = ImageFont.load_default()
        
        # Calculate text position to center it
        text_width = d.textlength(text, font=font) if hasattr(d, 'textlength') else len(text) * 10
        text_x = (width - text_width) // 2
        text_y = (height - 36) // 2
        
        d.text((text_x, text_y), text, fill=(255, 255, 255), font=font)
    else:
        # Draw a simple shape as placeholder
        d.rectangle([width//4, height//4, 3*width//4, 3*height//4], outline=(255, 255, 255), width=3)
    
    # Save the image
    img.save(f'images/{filename}')

# Create all required placeholder images
placeholders = [
    (800, 600, 'hallulies-logo.png', 'Hallulies Logo'),
    (800, 600, 'room1.1otherview.jpeg', 'Luxury Room'),
    (800, 600, 'hall1.jpeg', 'Main Hall'),
    (800, 600, 'Bar7.jpeg', 'Bar Lounge'),
    (800, 600, 'sittingPlace1.jpeg', 'Sitting Area'),
    (800, 600, 'parking-area.jpg', 'Parking Area'),
    (1200, 800, 'eventPlace1.jpeg', 'Event Place'),
    (800, 600, 'restaurant-view.jpg', 'Restaurant'),
    (1200, 800, 'hero-bg.jpg', 'Hero Background')
]

# Create all placeholder images
for width, height, filename, text in placeholders:
    create_placeholder_image(width, height, filename, text)
    print(f"Created placeholder: {filename}")

print("All placeholder images created successfully!")