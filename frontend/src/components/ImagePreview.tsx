import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface ImageData {
  url: string;
  expiresAt: string;
}

export default function ImagePreview() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImageData = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

        const response = await fetch(`${apiBaseUrl}/api/file/${fileId}`);
        if (!response.ok) {
          throw new Error("이미지를 찾을 수 없습니다.");
        }
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setImageData({
          url: imageUrl,
          expiresAt: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "이미지 로딩 중 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchImageData();
  }, [fileId]);

  const handleDownload = () => {
    if (imageData) {
      const link = document.createElement("a");
      link.href = imageData.url;
      link.download = `image-${fileId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center w-full max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">
            오류 발생
          </h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              이미지 프리뷰
            </h1>
            {imageData && (
              <div className="space-y-4">
                <div className="relative w-full">
                  <img
                    src={imageData.url}
                    alt="Preview"
                    className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                    style={{ maxWidth: "100%" }}
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                  <p className="text-xs sm:text-sm text-gray-500">
                    만료일: {new Date(imageData.expiresAt).toLocaleString()}
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    <button
                      onClick={handleDownload}
                      className="bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base w-full sm:w-auto"
                    >
                      다운로드
                    </button>
                    <button
                      onClick={() => navigate("/")}
                      className="bg-gray-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base w-full sm:w-auto"
                    >
                      홈으로
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
