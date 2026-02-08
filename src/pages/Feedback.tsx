import { useState, useEffect, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { feedbackAPI } from '../services/api';
import { Feedback as FeedbackType } from '../services/mockData';
import { toast } from 'sonner';

export default function Feedback() {
  const { t } = useContext(LanguageContext);
  const { themeColor } = useContext(ThemeContext);
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表单状态
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const data = await feedbackAPI.getFeedbacks();
      setFeedbacks(data);
    } catch (error) {
      toast.error('获取反馈数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const previews: string[] = [];

    fileArray.forEach(file => {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} 不是图片文件`);
        return;
      }

      // 检查文件大小
      if (file.size > MAX_FILE_SIZE) {
        toast.error(t('fileTooLarge'));
        return;
      }

      validFiles.push(file);

      // 创建预览
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === validFiles.length) {
          setImagePreviews(prev => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error(t('enterFeedbackTitle'));
      return;
    }

    if (!description.trim()) {
      toast.error(t('enterFeedbackDescription'));
      return;
    }

    setIsSubmitting(true);
    try {
      // 在实际应用中，这里应该上传图片到服务器并获取URL
      // 现在我们只是模拟图片URL
      const imageUrls = images.map((_, index) => `https://via.placeholder.com/300?text=Image${index + 1}`);

      const newFeedback = await feedbackAPI.createFeedback({
        title: title.trim(),
        description: description.trim(),
        images: imageUrls
      });

      setFeedbacks([newFeedback, ...feedbacks]);

      // 重置表单
      setTitle('');
      setDescription('');
      setImages([]);
      setImagePreviews([]);

      toast.success(t('feedbackSubmitted'));
    } catch (error) {
      toast.error(t('feedbackSubmitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-[#0d1117]/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'reviewed':
        return '已查看';
      case 'resolved':
        return '已解决';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('feedback')}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{t('manageFeedback')}</p>
      </div>

      {/* 提交反馈表单 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('submitFeedback')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('feedbackTitle')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('enterFeedbackTitle')}
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('feedbackDescription')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#1f242d] rounded-lg dark:bg-[#161b22] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder={t('enterFeedbackDescription')}
            />
          </div>

          {/* 图片上传区域 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('uploadImages')} <span className="text-gray-500 text-xs">({t('maxFileSize')}: 5MB)</span>
            </label>

            {/* 拖拽上传区域 */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-[#1f242d] hover:border-gray-400 dark:hover:border-gray-600'
                }
              `}
            >
              <i className="fa-solid fa-cloud-arrow-up text-4xl text-gray-400 mb-2"></i>
              <p className="text-gray-600 dark:text-gray-400">{t('dragDropImages')}</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>

            {/* 图片预览 */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {t('imagesUploaded')}: {imagePreviews.length}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-[#1f242d]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title={t('removeImage')}
                      >
                        <i className="fa-solid fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg font-medium text-white bg-${themeColor}-500 hover:bg-${themeColor}-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center`}
            >
              {isSubmitting && <i className="fa-solid fa-spinner fa-spin mr-2"></i>}
              {t('submitFeedback')}
            </button>
          </div>
        </form>
      </motion.div>

      {/* 反馈列表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-[#0d1117] rounded-xl shadow-sm border border-gray-200 dark:border-[#1f242d] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-[#1f242d]">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('feedbackList')}
          </h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {isLoading ? (
            <div className="p-12 text-center">
              <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-400"></i>
              <p className="mt-2 text-gray-500 dark:text-gray-400">{t('loading')}</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="p-12 text-center">
              <i className="fa-solid fa-comments fa-2xl text-gray-300 dark:text-gray-700"></i>
              <p className="mt-2 text-gray-500 dark:text-gray-400">{t('noFeedback')}</p>
            </div>
          ) : (
            feedbacks.map((feedback, index) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {feedback.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                    {getStatusText(feedback.status)}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {feedback.description}
                </p>

                {feedback.images && feedback.images.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                      {t('feedbackImages')}:
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {feedback.images.map((image, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={image}
                          alt={`Feedback image ${imgIndex + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-[#1f242d]"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                  <i className="fa-solid fa-calendar-days mr-2"></i>
                  {t('createdAt')}: {feedback.createdAt}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
