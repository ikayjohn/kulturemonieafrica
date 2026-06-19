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
    brightness: float = 1.03
    contrast: float = 1.07
    saturation: float = 1.06


PRODUCTS = [
    ProductCrop(
        source="impact-kulturebuddie-merchandise.png",
        output="kulturebuddie-pan-african-signature-hoodie.png",
        box=(0.16, 0.02, 0.62, 0.78),
    ),
    ProductCrop(
        source="marketplace-kulturebuddie.png",
        output="kulturebuddie-heritage-collector-desk-set.png",
        box=(0.24, 0.35, 0.82, 0.96),
        brightness=1.04,
        contrast=1.08,
    ),
    ProductCrop(
        source="impact-kulturebuddie-merchandise.png",
        output="kulturebuddie-krea84-festival-co-brand-pack.png",
        box=(0.00, 0.34, 0.72, 1.00),
    ),
    ProductCrop(
        source="impact-kulturebuddie-merchandise.png",
        output="kulturebuddie-creative-heritage-gift-box.png",
        box=(0.00, 0.42, 0.54, 1.00),
        brightness=1.05,
        contrast=1.08,
    ),
    ProductCrop(
        source="marketplace-kulturebuddie.png",
        output="kulturebuddie-gold-crest-cap-and-tote-set.png",
        box=(0.00, 0.44, 0.58, 0.98),
        brightness=1.04,
        contrast=1.08,
    ),
    ProductCrop(
        source="impact-kulturebuddie-merchandise.png",
        output="kulturebuddie-collectors-culture-mug-trio.png",
        box=(0.20, 0.46, 0.76, 1.00),
        brightness=1.05,
        contrast=1.08,
    ),
]


def export_crop(crop: ProductCrop) -> None:
    source = Image.open(IMAGES / crop.source).convert("RGB")
    width, height = source.size
    left, top, right, bottom = crop.box
    image = source.crop(
        (
            int(width * left),
            int(height * top),
            int(width * right),
            int(height * bottom),
        )
    )
    image = ImageOps.fit(image, OUT_SIZE, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    image = ImageEnhance.Brightness(image).enhance(crop.brightness)
    image = ImageEnhance.Contrast(image).enhance(crop.contrast)
    image = ImageEnhance.Color(image).enhance(crop.saturation)
    image = image.filter(ImageFilter.UnsharpMask(radius=1.2, percent=65, threshold=3))
    image.save(IMAGES / crop.output, quality=94)


def main() -> None:
    for crop in PRODUCTS:
        export_crop(crop)


if __name__ == "__main__":
    main()
