"use client";
import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload } from "lucide-react";

const PixelateImageTool = () => {
  const [image, setImage] = useState<string | null>(null);
  const [pixelSize, setPixelSize] = useState(10);
  const [pixelatedImage, setPixelatedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const pixelateImage = useCallback(() => {
    if (!image) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0, img.width, img.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let y = 0; y < canvas.height; y += pixelSize) {
        for (let x = 0; x < canvas.width; x += pixelSize) {
          const red = data[(canvas.width * y + x) * 4];
          const green = data[(canvas.width * y + x) * 4 + 1];
          const blue = data[(canvas.width * y + x) * 4 + 2];

          ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }

      setPixelatedImage(canvas.toDataURL());
    };
    img.src = image;
  }, [image, pixelSize]);

  const handleDownload = () => {
    if (pixelatedImage) {
      const link = document.createElement("a");
      link.href = pixelatedImage;
      link.download = "pixelated_image.png";
      link.click();
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto my-6">
      <CardHeader className="text-center">
        <CardTitle>Pixelate Image Tool</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-6 flex-col">
        <div className="space-y-4">
          <div>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            <Button onClick={triggerFileInput} className="w-full">
              <Upload className="mr-2 h-4 w-4" /> Upload Image
            </Button>
          </div>
          {image && (
            <div className="rounded-lg">
              <img
                src={image}
                alt="Original"
                className="w-full mb-2 rounded-lg"
              />
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-lg">
              <Label htmlFor="pixel-size" className="text-base">
                Pixel Size
              </Label>
              <span className="text-muted-foreground">{pixelSize} px</span>
            </div>
            <Slider
              id="pixel-size"
              min={1}
              max={20}
              step={1}
              value={[pixelSize]}
              onValueChange={(value) => setPixelSize(value[0])}
            />
          </div>
          {image && (
            <Button
              onClick={pixelateImage}
              disabled={!image}
              className="w-full"
            >
              Pixelate Image
            </Button>
          )}
        </div>
        {pixelatedImage && (
          <div className="space-y-2">
            <Label className="text-xl">Pixelate Image:</Label>
            <img
              src={pixelatedImage}
              alt="Pixelated"
              className="w-full mb-2 rounded-lg"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="w-full">
        {pixelatedImage && (
          <Button
            onClick={handleDownload}
            className="w-full"
            disabled={!pixelatedImage}
          >
            Download Pixelated Image
          </Button>
        )}
      </CardFooter>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </Card>
  );
};

export default PixelateImageTool;
