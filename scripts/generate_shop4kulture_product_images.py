from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "assets" / "images"
OUT_SIZE = (1200, 900)


@dataclass(frozen=True)
class ProductCrop:
    source: str
    output: str
    box: tuple[float, float, float, float]
    brightness: float = 1.0
    contrast: float = 1.04
    saturation: float = 1.04


PRODUCTS = [
    ProductCrop(
        source="impact-kulturebuddie-merchandise.png",
        output="shop4kulture-ankara-heritage-wall-set-v2.png",
        box=(0.22, 0.00, 0.78, 0.58),
        brightness=1.04,
        contrast=1.08,
        saturation=1.02,
    ),
    ProductCrop(
        source="marketplace-crea80candy.png",
        output="shop4kulture-afrobeats-sync-license-pack-v2.png",
        box=(0.00, 0.05, 0.78, 0.92),
        brightness=1.02,
        contrast=1.06,
        saturation=1.04,
    ),
    ProductCrop(
        source="impact-shop4kulture.png",
        output="shop4kulture-adire-luxe-capsule-robe-v2.png",
        box=(0.23, 0.00, 0.58, 0.86),
        brightness=1.04,
        contrast=1.08,
        saturation=1.08,
    ),
    ProductCrop(
        source="impact-kulturebuddie-merchandise.png",
        output="shop4kulture-krea84-festival-merch-bundle-v2.png",
        box=(0.00, 0.34, 0.72, 1.00),
        brightness=1.04,
        contrast=1.07,
        saturation=1.06,
    ),
    ProductCrop(
        source="marketplace-kulturemonie-token-m8.png",
        output="shop4kulture-m8-genesis-collectible-drop-v2.png",
        box=(0.23, 0.00, 0.78, 0.80),
        brightness=1.02,
        contrast=1.08,
        saturation=1.04,
    ),
    ProductCrop(
        source="marketplace-kulturebuddie.png",
        output="shop4kulture-pan-african-streetwear-gift-set-v2.png",
        box=(0.00, 0.18, 0.88, 0.98),
        brightness=1.04,
        contrast=1.08,
        saturation=1.06,
    ),
]


def scaled_crop(image: Image.Image, box: tuple[float, float, float, float]) -> Image.Image:
    width, height = image.size
    left, top, right, bottom = box
    crop = image.crop(
        (
            int(width * left),
            int(height * top),
            int(width * right),
            int(height * bottom),
        )
    )
    return ImageOps.fit(crop, OUT_SIZE, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def finish(image: Image.Image, crop: ProductCrop) -> Image.Image:
    image = ImageEnhance.Brightness(image).enhance(crop.brightness)
    image = ImageEnhance.Contrast(image).enhance(crop.contrast)
    image = ImageEnhance.Color(image).enhance(crop.saturation)

    # A very light sharpen keeps card-size crops crisp without adding a fake illustration look.
    sharp = image.filter(ImageFilter.UnsharpMask(radius=1.2, percent=65, threshold=3))
    return sharp.convert("RGB")


def main() -> None:
    for crop in PRODUCTS:
        source = Image.open(IMAGES / crop.source).convert("RGB")
        product = finish(scaled_crop(source, crop.box), crop)
        product.save(IMAGES / crop.output, quality=94)


if __name__ == "__main__":
    main()
