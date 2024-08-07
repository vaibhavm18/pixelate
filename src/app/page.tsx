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
import { Camera, Upload, Download } from "lucide-react";
import imageCompression from "browser-image-compression";
import { Progress } from "@/components/ui/progress";

const PixelateImageTool: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [pixelSize, setPixelSize] = useState(10);
  const [pixelatedImage, setPixelatedImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      setProgress(0);
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImage(e.target?.result as string);
          setIsCompressing(false);
          setProgress(100);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Error compressing image:", error);
        setIsCompressing(false);
        setProgress(0);
      }
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
    <div className="p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-6xl mx-auto my-8">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <img
              src="dlogo.png"
              alt="Logo"
              className="w-16 h-16 object-contain"
            />
            <CardTitle className="text-2xl font-bold">
              Pixelate Image Tool
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-12 w-full">
          {/* File upload section */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-6">Upload Image</h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 flex flex-col gap-6">
                <p className="text-sm">
                  Upload an image to pixelate.
                </p>
                <div className="w-full h-40 bg-gray-100 rounded-lg flex-1 flex items-center justify-center min-h-40">
                  {image ? (
                    <img
                      src={image}
                      alt="Uploaded image"
                      className="h-full w-full object-cover rounded-lg"
                    />
                  ) : (
                    <Camera className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                <Button
                  onClick={triggerFileInput}
                  className="w-full text-sm"
                  variant="outline"
                  disabled={isCompressing}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isCompressing ? "Compressing..." : "Choose Image"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              {pixelatedImage && (
                <div className="flex-1 flex flex-col gap-6">
                  <h3 className="text-lg font-medium">Pixelated Image</h3>
                  <div className="relative w-full h-40 flex-1 flex items-center justify-center bg-gray-100 rounded-lg">
                    <img src={pixelatedImage} alt="Pixelated" className="max-w-full h-auto rounded-lg" />
                  </div>
                  <Button
                    onClick={handleDownload}
                    className="w-full text-sm"
                    disabled={!pixelatedImage}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download Pixelated Image
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Pixelate settings */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="pixel-size" className="text-lg font-medium">
                  Pixel Size:
                </Label>
                <span className="text-sm font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                  {pixelSize}px
                </span>
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
          </div>

          {/* Pixelate action */}
          <div className="flex flex-col gap-4">
            {isCompressing && (
              <div className="w-full space-y-2">
                <Label className="text-sm font-medium">Compressing image... {progress}%</Label>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <div className="flex justify-center">
              <Button
                onClick={pixelateImage}
                className="px-8 py-4 text-lg font-semibold"
                disabled={!image || isCompressing}
              >
                Pixelate Image
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default PixelateImageTool;