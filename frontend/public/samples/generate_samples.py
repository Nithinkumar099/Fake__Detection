import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import cv2

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

def create_text_samples():
    print("Generating text samples...")
    authentic_text = (
        "According to a peer-reviewed study published by researchers at Cambridge University and reported by Reuters, "
        "new advancements in solid-state lithium battery chemistry have demonstrated a 40 percent improvement in energy density "
        "over conventional electrolyte configurations. Spokespersons for the international materials consortium confirmed that "
        "laboratory testing was validated through standardized cyclical stress evaluations across 1,000 thermal cycles. "
        "Findings were corroborated by the Department of Energy materials laboratory."
    )
    with open(os.path.join(OUTPUT_DIR, "authentic_news.txt"), "w", encoding="utf-8") as f:
        f.write(authentic_text)

    fake_text = (
        "SHOCKING SECRET EXPOSED! BIG PHARMA DOESN'T WANT YOU TO KNOW THIS FORBIDDEN TRUTH! "
        "A miracle cure using common lemon water and magnetic frequency waves has been 100% PROVEN to instantly cure all illnesses! "
        "Government deep state agencies have CENSORED this unbelievable breakthrough to protect hospital profits! "
        "What happens next will blow your mind! WAKE UP SHEEPLE before this hidden broadcast is completely banned by corrupt doctors!!!"
    )
    with open(os.path.join(OUTPUT_DIR, "fake_news.txt"), "w", encoding="utf-8") as f:
        f.write(fake_text)

def create_image_samples():
    print("Generating image samples for ELA forensics...")
    width, height = 640, 480

    # 1. Authentic Image: Clean gradient with natural geometric scenery
    img_orig = Image.new("RGB", (width, height), color=(20, 30, 50))
    draw = ImageDraw.Draw(img_orig)

    # Draw simulated landscape elements
    # Horizon / sky gradient
    for y in range(height // 2):
        r = int(20 + (y / (height / 2)) * 40)
        g = int(30 + (y / (height / 2)) * 60)
        b = int(70 + (y / (height / 2)) * 100)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Mountains / hills
    points1 = [(0, 320), (160, 200), (320, 280), (480, 180), (640, 310), (640, 480), (0, 480)]
    draw.polygon(points1, fill=(35, 75, 55))

    points2 = [(0, 360), (200, 270), (400, 340), (640, 260), (640, 480), (0, 480)]
    draw.polygon(points2, fill=(25, 55, 40))

    # Add sun / celestial body
    draw.ellipse([(460, 60), (540, 140)], fill=(250, 230, 140))

    # Add realistic subtle noise
    np_orig = np.array(img_orig)
    noise = np.random.normal(0, 4, np_orig.shape).astype(np.int16)
    np_noisy = np.clip(np_orig.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    authentic_pil = Image.fromarray(np_noisy)

    # Save original high-quality
    orig_path = os.path.join(OUTPUT_DIR, "original_photo.jpg")
    authentic_pil.save(orig_path, "JPEG", quality=95)

    # 2. Tampered Image: Splice a jarring foreign object and re-compress
    # Spliced block simulated from different source with severe compression difference
    tampered_pil = authentic_pil.copy()
    draw_tampered = ImageDraw.Draw(tampered_pil)

    # Insert a suspicious forged banner / overlay with sharp unnatural contrast
    spliced_box = [(180, 120), (460, 240)]
    draw_tampered.rectangle(spliced_box, fill=(220, 20, 60), outline=(255, 255, 0), width=4)
    draw_tampered.text((200, 160), "CLASSIFIED TAMPERED REGION", fill=(255, 255, 255))
    draw_tampered.text((220, 190), "HIGH ELA COMPRESSION ARTIFACT", fill=(255, 255, 0))

    # Save at lower quality and repeatedly resave spliced segment to maximize ELA artifact
    tampered_path = os.path.join(OUTPUT_DIR, "tampered_photo.jpg")
    tampered_pil.save(tampered_path, "JPEG", quality=75)

def create_video_sample():
    print("Generating video sample for temporal forensics...")
    width, height = 480, 360
    fps = 30
    duration_sec = 2
    total_frames = fps * duration_sec
    video_path = os.path.join(OUTPUT_DIR, "sample_video.mp4")

    # Use mp4v codec
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(video_path, fourcc, fps, (width, height))

    for i in range(total_frames):
        # Create animated frame
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        # Background color shifting smoothly
        frame[:, :] = (int(30 + 20 * np.sin(i / 10)), 25, 45)

        # Moving authentic circle
        cx = int(80 + (i / total_frames) * (width - 160))
        cy = int(height // 2 + 40 * np.sin(i / 5))
        cv2.circle(frame, (cx, cy), 35, (0, 220, 130), -1)

        # Draw frame number and timestamp
        timestamp = f"T: {i / fps:.2f}s | Frame {i+1}/{total_frames}"
        cv2.putText(frame, "Digital Truth Layer Forensic Video", (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        cv2.putText(frame, timestamp, (20, 80),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)

        out.write(frame)

    out.release()
    print("Demo samples generated successfully.")

if __name__ == "__main__":
    create_text_samples()
    create_image_samples()
    create_video_sample()
