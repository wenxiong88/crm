import { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../contexts/LanguageContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { toast } from 'sonner';
import { discoverAPI } from '../services/api';
import { DiscoverPost } from '../services/mockData';
import { cn } from '../lib/utils';

const CURRENT_USER = 'admin';

function timeAgo(dateStr: string, t: (key: string) => string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t('justNow');
  if (minutes < 60) return `${minutes} ${t('minutesAgo')}`;
  if (hours < 24) return `${hours} ${t('hoursAgo')}`;
  return `${days} ${t('daysAgo')}`;
}

function getAvatarColor(name: string): string {
  const colors = ['#f87171', '#fb923c', '#fbbf24', '#34d399', '#38bdf8', '#a78bfa', '#f472b6', '#2dd4bf'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const trendingTopics = [
  { key: 'topicWork', icon: '💼', color: 'from-blue-400 to-blue-600' },
  { key: 'topicTech', icon: '🚀', color: 'from-violet-400 to-purple-600' },
  { key: 'topicLife', icon: '🎉', color: 'from-orange-400 to-pink-500' },
  { key: 'topicIdea', icon: '💡', color: 'from-amber-400 to-orange-500' },
  { key: 'topicTeam', icon: '🤝', color: 'from-teal-400 to-emerald-500' },
  { key: 'topicGrowth', icon: '🌱', color: 'from-green-400 to-teal-500' },
];

export default function Discover() {
  const { t } = useContext(LanguageContext);
  const { themeMode } = useContext(ThemeContext);
  const isDark = themeMode === 'dark';
  const [posts, setPosts] = useState<DiscoverPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newImages, setNewImages] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [likeAnimating, setLikeAnimating] = useState<Set<string>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await discoverAPI.getPosts();
      setPosts(data);
    } catch {
      toast.error(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newContent.trim()) return;
    const images = newImages.trim()
      ? newImages.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    try {
      const post = await discoverAPI.createPost({ author: CURRENT_USER, content: newContent.trim(), images });
      setPosts(prev => [post, ...prev]);
      setNewContent('');
      setNewImages('');
      setShowCreateModal(false);
      toast.success(t('postPublished'));
    } catch {
      toast.error(t('addError'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await discoverAPI.deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      setDeleteTarget(null);
      toast.success(t('postDeleted'));
    } catch {
      toast.error(t('deleteError'));
    }
  };

  const handleToggleLike = async (postId: string) => {
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const liked = p.likedBy.includes(CURRENT_USER);
      return {
        ...p,
        likedBy: liked
          ? p.likedBy.filter(u => u !== CURRENT_USER)
          : [...p.likedBy, CURRENT_USER]
      };
    }));
    setLikeAnimating(prev => new Set(prev).add(postId));
    setTimeout(() => setLikeAnimating(prev => { const s = new Set(prev); s.delete(postId); return s; }), 600);
    await discoverAPI.toggleLike(postId, CURRENT_USER);
  };

  const handleAddComment = async (postId: string) => {
    const text = commentTexts[postId]?.trim();
    if (!text) return;
    try {
      const comment = await discoverAPI.addComment(postId, { author: CURRENT_USER, content: text });
      if (comment) {
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
        ));
        setCommentTexts(prev => ({ ...prev, [postId]: '' }));
        toast.success(t('commentAdded'));
      }
    } catch {
      toast.error(t('addError'));
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const s = new Set(prev);
      if (s.has(postId)) s.delete(postId);
      else s.add(postId);
      return s;
    });
  };

  const toggleBookmark = (postId: string) => {
    setBookmarked(prev => {
      const s = new Set(prev);
      if (s.has(postId)) s.delete(postId);
      else s.add(postId);
      return s;
    });
  };

  const handleShare = (post: DiscoverPost) => {
    const text = `${post.author}: ${post.content.slice(0, 100)}`;
    navigator.clipboard?.writeText(text);
    toast.success(t('shared'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <i className="fa-solid fa-spinner fa-spin text-xl"></i>
          <span>{t('loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                <i className="fa-solid fa-compass text-white text-lg"></i>
              </div>
              {t('discover')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('manageDiscover')}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setShowCreateModal(true); setTimeout(() => contentRef.current?.focus(), 100); }}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            {t('createPost')}
          </motion.button>
        </div>

        {/* Quick Post Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => { setShowCreateModal(true); setTimeout(() => contentRef.current?.focus(), 100); }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-4 mb-5 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: getAvatarColor(CURRENT_USER) }}
            >
              {CURRENT_USER.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 dark:bg-gray-700/50 text-sm text-gray-400 dark:text-gray-500">
              {t('whatsOnYourMind')}
            </div>
            <div className="flex gap-1">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                <i className="fa-regular fa-image"></i>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                <i className="fa-regular fa-face-smile"></i>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trending Topics */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-5"
        >
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <i className="fa-solid fa-fire text-orange-400"></i>
            {t('trendingTopics')}
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {trendingTopics.map((topic, i) => (
              <motion.button
                key={topic.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white whitespace-nowrap shadow-sm",
                  `bg-gradient-to-r ${topic.color}`
                )}
              >
                <span>{topic.icon}</span>
                {t(topic.key)}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Post Feed */}
      <div className="max-w-2xl mx-auto px-4 pb-8 space-y-5">
        <AnimatePresence>
          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 flex items-center justify-center">
                <i className="fa-regular fa-compass text-4xl text-orange-400 dark:text-orange-300"></i>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">{t('noPosts')}</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">{t('whatsOnYourMind')}</p>
            </motion.div>
          ) : (
            posts.map((post, index) => {
              const isLiked = post.likedBy.includes(CURRENT_USER);
              const isOwner = post.author === CURRENT_USER;
              const showComments = expandedComments.has(post.id);

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600/50 transition-all duration-300"
                >
                  {/* Post Header */}
                  <div className="px-5 pt-4 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: getAvatarColor(post.author) }}
                      >
                        {post.author.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{post.author}</span>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(post.createdAt, t)}</p>
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => setDeleteTarget(post.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="px-5 pb-3">
                    <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  </div>

                  {/* Post Images */}
                  {post.images.length > 0 && (
                    <div className={cn(
                      "px-5 pb-3 gap-2",
                      post.images.length === 1 ? "flex" : "grid grid-cols-2"
                    )}>
                      {post.images.map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setImagePreview(img)}
                          className={cn(
                            "rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer group/img",
                            post.images.length === 1 ? "max-h-96 w-full" : "aspect-square"
                          )}
                        >
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Liked-by avatars */}
                  {post.likedBy.length > 0 && (
                    <div className="px-5 pb-1 flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {post.likedBy.slice(0, 5).map((user, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-[8px] font-bold"
                            style={{ backgroundColor: getAvatarColor(user), zIndex: 5 - i }}
                            title={user}
                          >
                            {user.slice(0, 1).toUpperCase()}
                          </div>
                        ))}
                      </div>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        {post.likedBy.length} {t('likedByPeople')}
                      </span>
                    </div>
                  )}

                  {/* Like & Comment Bar */}
                  <div className="px-5 py-2 flex items-center border-t border-gray-50 dark:border-gray-700/50">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => handleToggleLike(post.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isLiked
                          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                      )}
                    >
                      <motion.i
                        animate={likeAnimating.has(post.id) && isLiked ? { scale: [1, 1.4, 1] } : {}}
                        transition={{ duration: 0.4 }}
                        className={cn(
                          isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart"
                        )}
                      ></motion.i>
                      {post.likedBy.length > 0 && <span>{post.likedBy.length}</span>}
                    </motion.button>

                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <i className="fa-regular fa-comment"></i>
                      {post.comments.length > 0 && <span>{post.comments.length}</span>}
                    </button>

                    <button
                      onClick={() => handleShare(post)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <i className="fa-solid fa-share-nodes"></i>
                    </button>

                    <div className="flex-1"></div>

                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => toggleBookmark(post.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        bookmarked.has(post.id)
                          ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                      )}
                    >
                      <i className={cn(
                        bookmarked.has(post.id) ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"
                      )}></i>
                    </motion.button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {showComments && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 border-t border-gray-50 dark:border-gray-700/50">
                          {/* Existing Comments */}
                          {post.comments.length > 0 && (
                            <div className="pt-3 space-y-3">
                              {post.comments.map(c => (
                                <div key={c.id} className="flex gap-2.5">
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5"
                                    style={{ backgroundColor: getAvatarColor(c.author) }}
                                  >
                                    {c.author.slice(0, 1).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
                                      <span className="font-semibold text-xs text-gray-900 dark:text-white">{c.author}</span>
                                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{c.content}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 ml-3">{timeAgo(c.createdAt, t)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Comment Input */}
                          <div className="flex gap-2 mt-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ backgroundColor: getAvatarColor(CURRENT_USER) }}
                            >
                              {CURRENT_USER.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={commentTexts[post.id] || ''}
                                onChange={e => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={e => { if (e.key === 'Enter') handleAddComment(post.id); }}
                                placeholder={t('writeComment')}
                                className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                              />
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleAddComment(post.id)}
                                disabled={!commentTexts[post.id]?.trim()}
                                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors disabled:cursor-not-allowed"
                              >
                                <i className="fa-solid fa-paper-plane text-xs"></i>
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('createPost')}</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: getAvatarColor(CURRENT_USER) }}
                  >
                    {CURRENT_USER.slice(0, 1).toUpperCase()}
                  </div>
                  <textarea
                    ref={contentRef}
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder={t('postContent')}
                    rows={4}
                    className="flex-1 text-sm px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
                    <i className="fa-regular fa-image mr-1.5"></i>
                    {t('postImageUrl')}
                  </label>
                  <input
                    type="text"
                    value={newImages}
                    onChange={e => setNewImages(e.target.value)}
                    placeholder={t('imageUrlPlaceholder')}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  {t('cancel')}
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreatePost}
                  disabled={!newContent.trim()}
                  className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white rounded-xl shadow-sm transition-all disabled:cursor-not-allowed"
                >
                  {t('publish')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Lightbox */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-pointer"
            onClick={() => setImagePreview(null)}
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={imagePreview}
              alt=""
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-trash-can text-red-500 text-lg"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('deletePost')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('confirmDeletePost')}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(deleteTarget)}
                    className="px-5 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-sm transition-colors"
                  >
                    {t('delete')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
