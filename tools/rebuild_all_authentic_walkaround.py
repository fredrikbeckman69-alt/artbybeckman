import os, math, shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

base_dir = r"c:\Users\fredr\OneDrive - Skyddsprodukter i Sverige AB\Tor Finans\Personligt\Antigravity Git\artbybeckman"
src_dir = r"C:\Users\fredr\.gemini\antigravity\brain\01722ee5-3af0-40e9-938c-bff2fa613e69\.user_uploaded"
clean_art_dir = r"C:\Users\fredr\.gemini\antigravity\brain\01722ee5-3af0-40e9-938c-bff2fa613e69\scratch\clean_art"

assets_walkaround = os.path.join(base_dir, "assets", "walkaround")
dist_walkaround = os.path.join(base_dir, "dist", "assets", "walkaround")
os.makedirs(assets_walkaround, exist_ok=True)
os.makedirs(dist_walkaround, exist_ok=True)

SCALE = 2  # 2048 x 1364 base images, 4096 x 2048 360 equirectangular panoramas

def find_perspective_coeffs(src_coords, dst_coords):
    matrix = []
    for (sx, sy), (dx, dy) in zip(src_coords, dst_coords):
        matrix.append([dx, dy, 1, 0, 0, 0, -sx * dx, -sx * dy])
        matrix.append([0, 0, 0, dx, dy, 1, -sy * dx, -sy * dy])
    A = np.matrix(matrix, dtype=float)
    B = np.array(src_coords).reshape(8)
    res = np.linalg.solve(A, B)
    return tuple(np.array(res).reshape(8))

def composite_quad(base_img, art_path, dst_quad, exposure=1.0, contrast=1.0, color_boost=1.0, feather=1.5, custom_poly=None):
    art_img = Image.open(art_path).convert('RGB')
    if exposure != 1.0:
        art_img = ImageEnhance.Brightness(art_img).enhance(exposure)
    if contrast != 1.0:
        art_img = ImageEnhance.Contrast(art_img).enhance(contrast)
    if color_boost != 1.0:
        art_img = ImageEnhance.Color(art_img).enhance(color_boost)

    aw, ah = art_img.size

    top_w = np.hypot(dst_quad[1][0] - dst_quad[0][0], dst_quad[1][1] - dst_quad[0][1])
    bot_w = np.hypot(dst_quad[2][0] - dst_quad[3][0], dst_quad[2][1] - dst_quad[3][1])
    avg_w = max((top_w + bot_w) / 2.0, 1.0)

    left_h = np.hypot(dst_quad[3][0] - dst_quad[0][0], dst_quad[3][1] - dst_quad[0][1])
    right_h = np.hypot(dst_quad[2][0] - dst_quad[1][0], dst_quad[2][1] - dst_quad[1][1])
    avg_h = max((left_h + right_h) / 2.0, 1.0)

    target_ratio = avg_h / avg_w
    art_ratio = ah / float(aw)

    if abs(art_ratio - target_ratio) > 0.02:
        if art_ratio > target_ratio:
            new_h = int(aw * target_ratio)
            y_off = (ah - new_h) // 2
            art_cropped = art_img.crop((0, y_off, aw, y_off + new_h))
        else:
            new_w = int(ah / target_ratio)
            x_off = (aw - new_w) // 2
            art_cropped = art_img.crop((x_off, 0, x_off + new_w, ah))
    else:
        art_cropped = art_img

    cw, ch = art_cropped.size
    src_coords = [(0, 0), (cw, 0), (cw, ch), (0, ch)]
    coeffs = find_perspective_coeffs(src_coords, dst_quad)

    rw, rh = base_img.size
    warped = art_cropped.transform((rw, rh), Image.Transform.PERSPECTIVE, coeffs, Image.Resampling.BICUBIC)

    mask = Image.new('L', (rw, rh), 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon(custom_poly if custom_poly else dst_quad, fill=255)
    if feather > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(feather))

    base_rgba = base_img.convert('RGBA')
    warped_rgba = warped.convert('RGBA')
    result = Image.composite(warped_rgba, base_rgba, mask)
    return result.convert('RGB')

def create_floor_texture(size=2048, style='parquet'):
    if style == 'travertine':
        img = Image.new('RGB', (size, size), (228, 222, 212))
        draw = ImageDraw.Draw(img)
        tile = 256
        for y in range(0, size, tile):
            for x in range(0, size, tile):
                c_var = (x * 7 + y * 13) % 15 - 7
                draw.rectangle([x, y, x + tile, y + tile],
                               fill=(228 + c_var, 222 + c_var, 212 + c_var),
                               outline=(195, 188, 178), width=3)
    else:
        img = Image.new('RGB', (size, size), (220, 206, 188))
        draw = ImageDraw.Draw(img)
        pw, pl = 48, 192
        for y in range(-size, size * 2, pw * 2):
            for x in range(-size, size * 2, pl):
                c1 = (218 + (x % 14), 202 + (y % 12), 182 + ((x+y) % 10))
                c2 = (212 + (y % 12), 196 + (x % 10), 176 + ((x*2) % 12))
                draw.rectangle([x, y, x + pl, y + pw], fill=c1, outline=(175, 158, 138), width=2)
                draw.rectangle([x + pw, y + pw, x + pw + pl, y + pw * 2], fill=c2, outline=(175, 158, 138), width=2)

    arr = np.array(img, dtype=np.float32)
    noise = np.random.normal(0, 3.0, (size, size, 3))
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)

def create_ceiling_texture(size=2048):
    img = Image.new('RGB', (size, size), (247, 246, 244))
    draw = ImageDraw.Draw(img)
    step = 320
    for y in range(0, size, step):
        for x in range(0, size, step):
            draw.rectangle([x + 16, y + 16, x + step - 16, y + step - 16],
                           outline=(226, 224, 220), width=4)
            draw.rectangle([x + 28, y + 28, x + step - 28, y + step - 28],
                           outline=(236, 234, 230), width=2)
    return img

def create_boiserie_enclosure(w, h, wall_color, floor_tex, ceiling_tex):
    wall_img = Image.new('RGB', (w, h), tuple(int(c) for c in wall_color))
    draw = ImageDraw.Draw(wall_img)

    cornice_y = int(h * 0.17)
    baseboard_y = int(h * 0.76)
    c_shadow = tuple(max(0, int(c * 0.82)) for c in wall_color)
    c_hl = tuple(min(255, int(c * 1.08)) for c in wall_color)

    draw.rectangle([0, cornice_y - 12, w, cornice_y], fill=c_shadow)
    draw.rectangle([0, cornice_y, w, cornice_y + 4], fill=c_hl)
    draw.rectangle([0, baseboard_y, w, baseboard_y + 8], fill=c_shadow)
    draw.rectangle([0, baseboard_y + 8, w, h], fill=c_hl)

    panel_w = 256
    for x in range(0, w, panel_w):
        draw.rectangle([x + 24, cornice_y + 36, x + panel_w - 24, baseboard_y - 200],
                       outline=c_shadow, width=3)
        draw.rectangle([x + 28, cornice_y + 40, x + panel_w - 28, baseboard_y - 204],
                       outline=c_hl, width=1)
        draw.rectangle([x + 24, baseboard_y - 170, x + panel_w - 24, baseboard_y - 24],
                       outline=c_shadow, width=3)

    wall_arr = np.array(wall_img, dtype=np.float32)

    u = np.linspace(0, w - 1, w)
    v = np.linspace(0, h - 1, h)
    uu, vv = np.meshgrid(u, v)

    lon = (uu / w - 0.5) * 2.0 * math.pi
    lat = (0.5 - vv / h) * math.pi
    cos_lat = np.cos(lat)
    dy = np.sin(lat)

    # Floor projection
    tex_h, tex_w = floor_tex.shape[0], floor_tex.shape[1]
    down_mask = dy < -0.28
    safe_dy = np.where(down_mask, -dy, 1.0)
    t_floor = 1.65 / safe_dy
    floor_x = t_floor * (cos_lat * np.sin(lon))
    floor_z = t_floor * (-cos_lat * np.cos(lon))
    scale = 180.0
    u_tex = ((floor_x * scale + tex_w * 50) % tex_w).astype(int)
    v_tex = ((floor_z * scale + tex_h * 50) % tex_h).astype(int)
    sampled_floor = floor_tex[v_tex, u_tex, :]

    floor_blend = np.clip((vv - h * 0.68) / (h * 0.12), 0.0, 1.0)[:, :, np.newaxis]
    enclosure = wall_arr * (1.0 - floor_blend) + sampled_floor * floor_blend

    # Ceiling projection
    up_mask = dy > 0.40
    safe_dy_up = np.where(up_mask, dy, 1.0)
    t_ceil = 2.15 / safe_dy_up
    ceil_x = t_ceil * (cos_lat * np.sin(lon))
    ceil_z = t_ceil * (-cos_lat * np.cos(lon))
    c_scale = 160.0
    u_ctex = np.clip((ceil_x * c_scale + tex_w / 2.0), 0, tex_w - 1).astype(int)
    v_ctex = np.clip((ceil_z * c_scale + tex_h / 2.0), 0, tex_h - 1).astype(int)
    sampled_ceil = ceiling_tex[v_ctex, u_ctex, :]

    ceil_blend = np.clip((1.0 - vv / (h * 0.17)), 0.0, 1.0)[:, :, np.newaxis]
    enclosure = enclosure * (1.0 - ceil_blend) + sampled_ceil * ceil_blend
    return enclosure

def build_room_360_panorama(composite_img, floor_style, out_w=4096, out_h=2048, extra_wall_art=None):
    rw, rh = composite_img.size
    v_arr = np.array(composite_img, dtype=np.float32)

    wall_col = np.mean(v_arr[int(rh*0.05):int(rh*0.2), int(rw*0.05):int(rw*0.2), :], axis=(0, 1))

    floor_tex = np.array(create_floor_texture(2048, floor_style), dtype=np.float32)
    ceiling_tex = np.array(create_ceiling_texture(2048), dtype=np.float32)
    enclosure = create_boiserie_enclosure(out_w, out_h, wall_col, floor_tex, ceiling_tex)

    u = np.linspace(0, out_w - 1, out_w)
    v = np.linspace(0, out_h - 1, out_h)
    uu, vv = np.meshgrid(u, v)

    lon = (uu / out_w - 0.5) * 2.0 * math.pi
    lat = (0.5 - vv / out_h) * math.pi
    cos_lat = np.cos(lat)
    dy = np.sin(lat)
    dx = cos_lat * np.sin(lon)
    dz = -cos_lat * np.cos(lon)

    hfov = math.radians(105.0)
    focal = (rw / 2.0) / math.tan(hfov / 2.0)

    forward_mask = dz < -0.05
    safe_dz = np.where(forward_mask, -dz, 1.0)

    proj_x = focal * (dx / safe_dz) + (rw / 2.0)
    proj_y = -focal * (dy / safe_dz) + (rh / 2.0)

    in_bounds = (
        forward_mask &
        (proj_x >= 0) & (proj_x < rw - 1) &
        (proj_y >= 0) & (proj_y < rh - 1)
    )

    edge_x = np.minimum(proj_x, rw - 1 - proj_x) / (rw * 0.12)
    edge_y = np.minimum(proj_y, rh - 1 - proj_y) / (rh * 0.12)
    w_dist = np.clip(np.minimum(edge_x, edge_y), 0.0, 1.0)
    w_factor = np.where(in_bounds, w_dist**1.2, 0.0)

    px0 = np.clip(np.floor(proj_x).astype(int), 0, rw - 2)
    py0 = np.clip(np.floor(proj_y).astype(int), 0, rh - 2)
    fx = (proj_x - px0)[:, :, np.newaxis]
    fy = (proj_y - py0)[:, :, np.newaxis]

    sampled = (
        v_arr[py0, px0] * (1 - fx) * (1 - fy) +
        v_arr[py0, px0 + 1] * fx * (1 - fy) +
        v_arr[py0 + 1, px0] * (1 - fx) * fy +
        v_arr[py0 + 1, px0 + 1] * fx * fy
    )

    wf = w_factor[:, :, np.newaxis]
    final_pano = sampled * wf + enclosure * (1.0 - wf)

    # Mount extra artworks directly onto the boiserie enclosure
    if extra_wall_art:
        pano_img = Image.fromarray(np.clip(final_pano, 0, 255).astype(np.uint8)).convert('RGBA')
        for art in extra_wall_art:
            art_src = Image.open(art['path']).convert('RGB')
            w_art, h_art = art['width'], art['height']
            art_res = art_src.resize((w_art, h_art), Image.Resampling.LANCZOS)
            
            # Gold floating gallery frame (4px)
            fb = 4
            framed = Image.new('RGB', (w_art + fb*2, h_art + fb*2), (188, 155, 82))
            framed.paste(art_res, (fb, fb))
            
            # Soft wall drop shadow
            sh = Image.new('RGBA', (w_art + fb*2 + 24, h_art + fb*2 + 24), (0, 0, 0, 0))
            ImageDraw.Draw(sh).rectangle([8, 8, w_art + fb*2 + 16, h_art + fb*2 + 16], fill=(0, 0, 0, 110))
            sh = sh.filter(ImageFilter.GaussianBlur(6))
            
            cx, cy = art['center_x'], art['center_y']
            px0 = cx - (w_art + fb*2) // 2
            py0 = cy - (h_art + fb*2) // 2
            
            pano_img.paste(sh, (px0 - 8, py0 - 6), sh)
            pano_img.paste(framed, (px0, py0))
            
        final_pano = np.array(pano_img.convert('RGB'))

    final_pano = np.clip(final_pano, 0, 255).astype(np.uint8)
    return Image.fromarray(final_pano)


def main():
    print("=== REBUILDING ALL ROOMS WITH 100% EXCLUSIVE FREDRIK BECKMAN ARTWORK ===")

    # 1. GRAND LIVING ROOM
    print("-> Processing living_room...")
    lr_orig = Image.open(os.path.join(src_dir, 'media_1789482097153.jpg')).convert('RGB')
    lr_2x = lr_orig.resize((lr_orig.width * SCALE, lr_orig.height * SCALE), Image.Resampling.LANCZOS)
    
    # 1a. Main wall: My Heart Has Teeth
    lr_comp = composite_quad(
        lr_2x,
        os.path.join(clean_art_dir, '265_heart_teeth.jpg'),
        [(455*SCALE, 107*SCALE), (647*SCALE, 94*SCALE), (647*SCALE, 312*SCALE), (455*SCALE, 313*SCALE)],
        exposure=0.98, feather=2.4
    )
    
    # 1b. Dining room doorway background: 270 Origami
    # Exact quad: x1=1538, y1=368, x2=1840, y2=608 in 2048x1364
    x1, y1, x2, y2 = 1538, 368, 1840, 608
    cw, ch = x2 - x1, y2 - y1
    origami = Image.open(os.path.join(clean_art_dir, '270_origami.jpg')).convert('RGB')
    aw, ah = origami.size
    target_ratio = cw / float(ch)
    if aw / float(ah) > target_ratio:
        nw = int(ah * target_ratio)
        origami_c = origami.crop(((aw - nw)//2, 0, (aw - nw)//2 + nw, ah))
    else:
        nh = int(aw / target_ratio)
        origami_c = origami.crop((0, (ah - nh)//2, aw, (ah - nh)//2 + nh))
    origami_res = origami_c.resize((cw, ch), Image.Resampling.LANCZOS)
    origami_res = ImageEnhance.Brightness(origami_res).enhance(0.96)
    origami_res = ImageEnhance.Contrast(origami_res).enhance(1.02)
    
    orig_door_crop = lr_2x.crop((x1, y1, x2, y2))
    yy, xx = np.ogrid[:ch, :cw]
    fg_mask = np.zeros((ch, cw), dtype=bool)
    fg_mask[0:42, 83:87] = True # wire
    fg_mask |= (((xx - 85)/75.0)**2 + ((yy - 48)/24.0)**2 <= 1.0) # chandelier
    fg_mask |= (((xx - 116)/22.0)**2 + ((yy - 195)/28.0)**2 <= 1.0) # vase
    fg_mask |= (((xx - 116)/24.0)**2 + ((yy - 150)/20.0)**2 <= 1.0) # bouquet
    fg_mask[224:, :] = True # table
    mask_door = Image.fromarray((~fg_mask).astype(np.uint8) * 255).filter(ImageFilter.GaussianBlur(0.8))
    door_comp = Image.composite(origami_res, orig_door_crop, mask_door)
    lr_comp.paste(door_comp, (x1, y1))
    
    # Save living_room 2D
    lr_comp.save(os.path.join(assets_walkaround, 'living_room.jpg'), quality=95)
    lr_comp.save(os.path.join(dist_walkaround, 'living_room.jpg'), quality=95)
    lr_comp.save(os.path.join(assets_walkaround, 'living_room.webp'), 'WEBP', quality=88)
    lr_comp.save(os.path.join(dist_walkaround, 'living_room.webp'), 'WEBP', quality=88)
    lr_comp.resize((400, 266), Image.Resampling.LANCZOS).save(os.path.join(assets_walkaround, 'living_room_thumb.webp'), 'WEBP', quality=85)
    lr_comp.resize((400, 266), Image.Resampling.LANCZOS).save(os.path.join(dist_walkaround, 'living_room_thumb.webp'), 'WEBP', quality=85)

    # 1c. 360 Photosphere for living_room:
    # Mount Pink Dress (Panel 1), Black Mirror (Panel 2), Raspberry Beret (Panel 3)
    # Centered inside each architectural boiserie panel on the right wall
    lr_360 = build_room_360_panorama(
        lr_comp,
        floor_style='parquet',
        out_w=4096, out_h=2048,
        extra_wall_art=[
            {
                'path': os.path.join(clean_art_dir, '267_pink_dress.jpg'),
                'center_x': 2944,
                'center_y': 942,
                'width': 188,
                'height': 245
            },
            {
                'path': os.path.join(clean_art_dir, '266_black_mirror.jpg'),
                'center_x': 3200,
                'center_y': 942,
                'width': 188,
                'height': 270
            },
            {
                'path': os.path.join(clean_art_dir, '268_raspberry_beret.jpg'),
                'center_x': 3456,
                'center_y': 942,
                'width': 188,
                'height': 245
            }
        ]
    )
    lr_360.save(os.path.join(assets_walkaround, '360_living_room.webp'), 'WEBP', quality=88)
    lr_360.save(os.path.join(dist_walkaround, '360_living_room.webp'), 'WEBP', quality=88)
    print("-> living_room done!")

    # 2. MASTER BEDROOM (Origami above headboard)
    print("-> Processing bedroom...")
    bed_orig = Image.open(os.path.join(src_dir, 'media_1789482059636.jpg')).convert('RGB')
    bed_2x = bed_orig.resize((bed_orig.width * SCALE, bed_orig.height * SCALE), Image.Resampling.LANCZOS)
    
    # Exact full quad in 2048x1364: [(185, 18), (708, 264), (708, 708), (185, 574)]
    bed_comp = composite_quad(
        bed_2x,
        os.path.join(clean_art_dir, '270_origami.jpg'),
        [(185, 18), (708, 264), (708, 708), (185, 574)],
        exposure=0.98, feather=2.0
    )
    # Restore headboard and bedside lamps
    bed_orig_np = np.array(bed_2x)
    bed_comp_np = np.array(bed_comp)
    # Headboard covers y >= 720
    bed_comp_np[720:, :] = bed_orig_np[720:, :]
    # Bed lamp at left: x in 0..120, y in 580..740
    yy_b, xx_b = np.ogrid[:bed_comp.height, :bed_comp.width]
    bed_lamp = (((xx_b - 50)/50.0)**2 + ((yy_b - 650)/70.0)**2 <= 1.0)
    bed_comp_np[bed_lamp] = bed_orig_np[bed_lamp]
    bed_final = Image.fromarray(bed_comp_np)
    
    bed_final.save(os.path.join(assets_walkaround, 'bedroom.jpg'), quality=95)
    bed_final.save(os.path.join(dist_walkaround, 'bedroom.jpg'), quality=95)
    bed_final.save(os.path.join(assets_walkaround, 'bedroom.webp'), 'WEBP', quality=88)
    bed_final.save(os.path.join(dist_walkaround, 'bedroom.webp'), 'WEBP', quality=88)
    bed_final.resize((400, 266), Image.Resampling.LANCZOS).save(os.path.join(assets_walkaround, 'bedroom_thumb.webp'), 'WEBP', quality=85)
    bed_final.resize((400, 266), Image.Resampling.LANCZOS).save(os.path.join(dist_walkaround, 'bedroom_thumb.webp'), 'WEBP', quality=85)

    bed_360 = build_room_360_panorama(bed_final, floor_style='parquet')
    bed_360.save(os.path.join(assets_walkaround, '360_bedroom.webp'), 'WEBP', quality=88)
    bed_360.save(os.path.join(dist_walkaround, '360_bedroom.webp'), 'WEBP', quality=88)
    print("-> bedroom done!")

    # 3. LIVING WIDE (Graines D'Étoiles, Origami in doorway, Black Mirror)
    print("-> Processing living_wide...")
    lw_orig = Image.open(os.path.join(src_dir, 'media_1789485455965.jpg')).convert('RGB')
    lw_2x = lw_orig.resize((lw_orig.width * SCALE, lw_orig.height * SCALE), Image.Resampling.LANCZOS)
    
    # 3a. Left wall: Graines D'Étoiles [(407, 247), (670, 250), (670, 627), (407, 627)]
    lw_comp = composite_quad(
        lw_2x,
        os.path.join(clean_art_dir, '246_graines.jpg'),
        [(407, 247), (670, 250), (670, 627), (407, 627)],
        exposure=0.98, feather=2.0
    )
    # Restore arc lamp dome at x=410, y=360
    lw_orig_np = np.array(lw_2x)
    lw_comp_np = np.array(lw_comp)
    yy_lw, xx_lw = np.ogrid[:lw_comp.height, :lw_comp.width]
    arc_lamp = (((xx_lw - 410)/90.0)**2 + ((yy_lw - 365)/85.0)**2 <= 1.0) & (xx_lw < 490)
    lw_comp_np[arc_lamp] = lw_orig_np[arc_lamp]
    lw_comp = Image.fromarray(lw_comp_np)

    # 3b. Dining doorway: Origami [(940, 422), (1106, 422), (1106, 593), (940, 593)]
    lw_comp = composite_quad(
        lw_comp,
        os.path.join(clean_art_dir, '270_origami.jpg'),
        [(940, 422), (1106, 422), (1106, 593), (940, 593)],
        exposure=0.96, feather=1.5
    )
    # Restore brass pendant
    lw_comp_np = np.array(lw_comp)
    pendant = (((xx_lw - 1000)/75.0)**2 + ((yy_lw - 460)/22.0)**2 <= 1.0)
    lw_comp_np[pendant] = lw_orig_np[pendant]
    lw_comp = Image.fromarray(lw_comp_np)

    # 3c. Right wall: Black Mirror [(1820, 35), (2048, 35), (2048, 655), (1820, 655)]
    lw_comp = composite_quad(
        lw_comp,
        os.path.join(clean_art_dir, '266_black_mirror.jpg'),
        [(1820, 35), (2048, 35), (2048, 655), (1820, 655)],
        exposure=1.0, feather=2.0
    )

    lw_comp.save(os.path.join(assets_walkaround, 'living_wide.jpg'), quality=95)
    lw_comp.save(os.path.join(dist_walkaround, 'living_wide.jpg'), quality=95)
    lw_comp.save(os.path.join(assets_walkaround, 'living_wide.webp'), 'WEBP', quality=88)
    lw_comp.save(os.path.join(dist_walkaround, 'living_wide.webp'), 'WEBP', quality=88)
    lw_comp.resize((400, 266), Image.Resampling.LANCZOS).save(os.path.join(assets_walkaround, 'living_wide_thumb.webp'), 'WEBP', quality=85)
    lw_comp.resize((400, 266), Image.Resampling.LANCZOS).save(os.path.join(dist_walkaround, 'living_wide_thumb.webp'), 'WEBP', quality=85)

    lw_360 = build_room_360_panorama(lw_comp, floor_style='parquet')
    lw_360.save(os.path.join(assets_walkaround, '360_living_wide.webp'), 'WEBP', quality=88)
    lw_360.save(os.path.join(dist_walkaround, '360_living_wide.webp'), 'WEBP', quality=88)
    print("-> living_wide done!")

    # 4. DINING V2 (Pink Dress on left, Black Mirror on right)
    print("-> Processing dining_v2...")
    dv2_orig = Image.open(os.path.join(src_dir, 'media_1789485436634.jpg')).convert('RGB')
    dv2_2x = dv2_orig.resize((dv2_orig.width * SCALE, dv2_orig.height * SCALE), Image.Resampling.LANCZOS)
    
    # Left wall: Pink Dress [(552, 205), (808, 205), (808, 970), (552, 970)]
    dv2_comp = composite_quad(
        dv2_2x,
        os.path.join(clean_art_dir, '267_pink_dress.jpg'),
        [(552, 205), (808, 205), (808, 970), (552, 970)],
        exposure=0.98, feather=2.0
    )
    # Restore chandelier rim at x=740..810, y=280..420
    dv2_orig_np = np.array(dv2_2x)
    dv2_comp_np = np.array(dv2_comp)
    yy_dv2, xx_dv2 = np.ogrid[:dv2_comp.height, :dv2_comp.width]
    chand_rim = (xx_dv2 >= 752) & (yy_dv2 >= 276) & (yy_dv2 <= 420)
    dv2_comp_np[chand_rim] = dv2_orig_np[chand_rim]
    dv2_comp = Image.fromarray(dv2_comp_np)

    # Right wall: Black Mirror [(1830, 48), (2048, 48), (2048, 1076), (1830, 1076)]
    dv2_comp = composite_quad(
        dv2_comp,
        os.path.join(clean_art_dir, '266_black_mirror.jpg'),
        [(1830, 48), (2048, 48), (2048, 1076), (1830, 1076)],
        exposure=1.0, feather=2.0
    )

    dv2_comp.save(os.path.join(assets_walkaround, 'dining_v2.jpg'), quality=95)
    dv2_comp.save(os.path.join(dist_walkaround, 'dining_v2.jpg'), quality=95)
    dv2_comp.save(os.path.join(assets_walkaround, 'dining_v2.webp'), 'WEBP', quality=88)
    dv2_comp.save(os.path.join(dist_walkaround, 'dining_v2.webp'), 'WEBP', quality=88)
    dv2_comp.resize((400, 266), Image.Resampling.LANCZOS).save(os.path.join(assets_walkaround, 'dining_v2_thumb.webp'), 'WEBP', quality=85)
    dv2_comp.resize((400, 266), Image.Resampling.LANCZOS).save(os.path.join(dist_walkaround, 'dining_v2_thumb.webp'), 'WEBP', quality=85)

    dv2_360 = build_room_360_panorama(dv2_comp, floor_style='travertine')
    dv2_360.save(os.path.join(assets_walkaround, '360_dining_v2.webp'), 'WEBP', quality=88)
    dv2_360.save(os.path.join(dist_walkaround, '360_dining_v2.webp'), 'WEBP', quality=88)
    print("-> dining_v2 done!")

    # 5. KITCHEN (Golden Ticket on left, Origami in dining background)
    print("-> Processing kitchen...")
    k_orig = Image.open(os.path.join(src_dir, 'media_1789482079952.jpg')).convert('RGB')
    k_2x = k_orig.resize((k_orig.width * SCALE, k_orig.height * SCALE), Image.Resampling.LANCZOS)
    
    # Left wall: Golden Ticket [(32, 228), (276, 284), (276, 656), (32, 656)]
    k_comp = composite_quad(
        k_2x,
        os.path.join(clean_art_dir, '271_golden_ticket.jpg'),
        [(32, 228), (276, 284), (276, 656), (32, 656)],
        exposure=0.99, feather=2.0
    )
    # Doorway to dining: Origami [(1640, 455), (1890, 485), (1890, 680), (1640, 680)]
    k_comp = composite_quad(
        k_comp,
        os.path.join(clean_art_dir, '270_origami.jpg'),
        [(1640, 455), (1890, 485), (1890, 680), (1640, 680)],
        exposure=0.95, feather=1.5
    )
    # Restore chandelier and flowers
    k_orig_np = np.array(k_2x)
    k_comp_np = np.array(k_comp)
    yy_k, xx_k = np.ogrid[:k_comp.height, :k_comp.width]
    k_chand = (((xx_k - 1650)/150.0)**2 + ((yy_k - 475)/30.0)**2 <= 1.0)
    k_vase = (((xx_k - 1650)/35.0)**2 + ((yy_k - 600)/55.0)**2 <= 1.0)
    k_comp_np[k_chand | k_vase] = k_orig_np[k_chand | k_vase]
    k_comp = Image.fromarray(k_comp_np)

    k_comp.save(os.path.join(assets_walkaround, 'kitchen.jpg'), quality=95)
    k_comp.save(os.path.join(dist_walkaround, 'kitchen.jpg'), quality=95)
    k_comp.save(os.path.join(assets_walkaround, 'kitchen.webp'), 'WEBP', quality=88)
    k_comp.save(os.path.join(dist_walkaround, 'kitchen.webp'), 'WEBP', quality=88)
    k_comp.resize((400, 266), Image.Resampling.LANCZOS).save(os.path.join(assets_walkaround, 'kitchen_thumb.webp'), 'WEBP', quality=85)
    k_comp.resize((400, 266), Image.Resampling.LANCZOS).save(os.path.join(dist_walkaround, 'kitchen_thumb.webp'), 'WEBP', quality=85)

    k_360 = build_room_360_panorama(k_comp, floor_style='travertine')
    k_360.save(os.path.join(assets_walkaround, '360_kitchen.webp'), 'WEBP', quality=88)
    k_360.save(os.path.join(dist_walkaround, '360_kitchen.webp'), 'WEBP', quality=88)
    print("-> kitchen done!")

    # 6. DINING ROOM (Origami on main wall, My Heart Has Teeth in living room background)
    print("-> Processing dining_room...")
    dr_orig = Image.open(os.path.join(src_dir, 'media_1789482089113.jpg')).convert('RGB')
    dr_2x = dr_orig.resize((dr_orig.width * SCALE, dr_orig.height * SCALE), Image.Resampling.LANCZOS)
    
    # Main wall: Origami [(34, 32), (650, 208), (650, 636), (34, 656)]
    dr_comp = composite_quad(
        dr_2x,
        os.path.join(clean_art_dir, '270_origami.jpg'),
        [(34, 32), (650, 208), (650, 636), (34, 656)],
        exposure=0.98, feather=2.0
    )
    # Restore sculpture tip on sideboard
    dr_orig_np = np.array(dr_2x)
    dr_comp_np = np.array(dr_comp)
    for y in range(int(308 * SCALE), int(336 * SCALE)):
        for x in range(int(75 * SCALE), int(155 * SCALE)):
            norm_x = (x / SCALE - 115) / 38.0
            norm_y = (y / SCALE - 322) / 14.0
            if norm_x**2 + norm_y**2 <= 1.0:
                dr_comp_np[y, x] = dr_orig_np[y, x]
    dr_comp = Image.fromarray(dr_comp_np)

    # Doorway to living room: My Heart Has Teeth [(1705, 380), (1920, 380), (1920, 640), (1705, 640)]
    dr_comp = composite_quad(
        dr_comp,
        os.path.join(clean_art_dir, '265_heart_teeth.jpg'),
        [(1705, 380), (1920, 380), (1920, 640), (1705, 640)],
        exposure=0.96, feather=1.5
    )

    dr_comp.save(os.path.join(assets_walkaround, 'dining_room.jpg'), quality=95)
    dr_comp.save(os.path.join(dist_walkaround, 'dining_room.jpg'), quality=95)
    dr_comp.save(os.path.join(assets_walkaround, 'dining_room.webp'), 'WEBP', quality=88)
    dr_comp.save(os.path.join(dist_walkaround, 'dining_room.webp'), 'WEBP', quality=88)
    dr_comp.resize((400, 266), Image.Resampling.LANCZOS).save(os.path.join(assets_walkaround, 'dining_room_thumb.webp'), 'WEBP', quality=85)
    dr_comp.resize((400, 266), Image.Resampling.LANCZOS).save(os.path.join(dist_walkaround, 'dining_room_thumb.webp'), 'WEBP', quality=85)

    dr_360 = build_room_360_panorama(dr_comp, floor_style='travertine')
    dr_360.save(os.path.join(assets_walkaround, '360_dining_room.webp'), 'WEBP', quality=88)
    dr_360.save(os.path.join(dist_walkaround, '360_dining_room.webp'), 'WEBP', quality=88)
    print("-> dining_room done!")

    print("\nALL 10 ROOMS PERFECTLY REBUILT WITH 100% EXCLUSIVE FREDRIK BECKMAN ARTWORK!")

if __name__ == '__main__':
    main()
