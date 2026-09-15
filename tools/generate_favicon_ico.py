import os
from PIL import Image, ImageDraw

def generate_favicon():
    size = 1024
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    # Scale factor from 512 viewBox to 1024
    scale = 2.0
    
    # Background rounded rect
    pad = int(16 * scale)
    r = int(112 * scale)
    border_w = int(6 * scale)
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=r,
        fill=(19, 21, 31, 255),
        outline=(38, 43, 66, 255),
        width=border_w
    )

    def s_pts(pts):
        return [(int(x * scale), int(y * scale)) for x, y in pts]

    # Draw polygonal facets matching the SVG
    draw.polygon(s_pts([(120, 380), (230, 140), (340, 290), (190, 430)]), fill=(114, 9, 183, 242))
    draw.polygon(s_pts([(230, 140), (410, 110), (340, 290), (280, 230)]), fill=(67, 97, 238, 242))
    draw.polygon(s_pts([(340, 290), (410, 110), (440, 330), (320, 410)]), fill=(247, 127, 0, 242))
    draw.polygon(s_pts([(140, 340), (280, 230), (320, 410), (180, 440)]), fill=(255, 0, 127, 235))
    draw.polygon(s_pts([(230, 140), (340, 290), (280, 230)]), fill=(255, 241, 118, 225))

    # Multi-resolution ICO
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
    images = [im.resize(sz, Image.Resampling.LANCZOS) for sz in ico_sizes]
    
    output_path = 'favicon.ico'
    images[0].save(
        output_path,
        format='ICO',
        sizes=ico_sizes,
        append_images=images[1:]
    )
    print(f"Generated {output_path} (sizes: {ico_sizes}, file size: {os.path.getsize(output_path)} bytes)")

if __name__ == '__main__':
    generate_favicon()
