import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAlbum, uploadMedia, deleteAlbum, getMediaUrl } from '../api';
import { ChevronLeft, Trash2, Plus, Loader2, PlayCircle, Image as ImageIcon, Calendar, X } from 'lucide-react';

export default function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  const fileInputRef = useRef(null);

  const fetchAlbum = async () => {
    try {
      setLoading(true);
      const res = await getAlbum(id);
      setAlbum(res.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo encontrar este álbum.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro/a de que querés borrar este recuerdo para siempre?')) {
      setDeleting(true);
      try {
        await deleteAlbum(id);
        navigate('/');
      } catch (err) {
        console.error(err);
        alert('Error al borrar el álbum.');
        setDeleting(false);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      await uploadMedia(id, formData);
      await fetchAlbum(); // Refresh to see new images
    } catch (err) {
      console.error(err);
      alert('Error al subir archivos.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isVideo = (filename) => {
    return filename.match(/\.(mp4|webm|mov|ogg)$/i);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-cream">
        <Loader2 className="w-10 h-10 animate-spin text-dusty-rose" />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-warm-cream text-center px-4">
        <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-playfair font-bold text-dark-charcoal mb-2">{error}</h2>
        <Link to="/" className="text-dusty-rose hover:text-dusty-rose/80 transition-colors font-medium flex items-center gap-1">
          <ChevronLeft size={20} /> Volver a nuestra historia
        </Link>
      </div>
    );
  }

  const date = new Date(album.date);

  return (
    <div className="min-h-screen bg-warm-cream pb-24">
      {/* Header Hero Section */}
      <div className="bg-white px-4 pt-8 pb-12 sm:px-6 lg:px-8 border-b border-dusty-rose/10 shadow-sm relative">
        <div className="max-w-5xl mx-auto">
          {/* Navigation & Actions */}
          <div className="flex items-center justify-between mb-10">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-gray-500 hover:text-dusty-rose transition-colors px-3 py-2 rounded-xl hover:bg-dusty-rose/5 -ml-3"
            >
              <ChevronLeft size={20} />
              <span className="font-medium text-sm hidden sm:inline">Volver al Timeline</span>
            </Link>

            <button 
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors disabled:opacity-50"
              title="Borrar álbum"
            >
              {deleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
            </button>
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-playfair font-bold text-dark-charcoal mb-4">
              {album.title}
            </h1>
            
            <div className="flex items-center justify-center gap-2 text-dusty-rose font-medium tracking-wide uppercase text-sm mb-6">
              <Calendar size={16} />
              {date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>

            {album.description && (
              <p className="text-gray-600 md:text-lg leading-relaxed">
                {album.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area - Masonry Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-500 font-medium text-sm uppercase tracking-wider">
            {album.media?.length || 0} recuerdos guardados
          </p>
          
          <div>
            <input
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,video/*"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-white text-dark-charcoal px-5 py-2.5 rounded-full shadow-sm hover:shadow-md border border-gray-100 hover:border-dusty-rose/30 transition-all text-sm font-medium disabled:opacity-70 group"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-dusty-rose" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Plus size={18} className="text-dusty-rose" />
                  Agregar fotos
                </>
              )}
            </button>
          </div>
        </div>

        {/* The Grid */}
        {album.media && album.media.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {album.media.map((mediaItem) => (
              <div 
                key={mediaItem.id} 
                className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl hover:shadow-dusty-rose/10 transition-all duration-500 transform hover:-translate-y-1 mb-6 border border-gray-100 cursor-pointer"
                onClick={() => setSelectedMedia(mediaItem)}
              >
                {isVideo(mediaItem.filename) ? (
                  <div className="relative">
                     <video 
                      src={getMediaUrl(mediaItem.filename)} 
                      className="w-full h-auto rounded-t-xl"
                      controls={false}
                      loop
                    />
                    <div className="play-overlay absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300">
                      <PlayCircle className="w-12 h-12 text-white/90 drop-shadow-md" />
                    </div>
                  </div>
                ) : (
                  <img 
                    src={getMediaUrl(mediaItem.filename)} 
                    alt="Album content" 
                    className="w-full h-auto rounded-t-xl object-cover" 
                    loading="lazy"
                  />
                )}
                {/* Optional tiny footer for media item if needed */}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/50 border-2 border-dashed border-dusty-rose/30 rounded-3xl p-16 text-center text-gray-500">
            <ImageIcon className="w-12 h-12 text-dusty-rose mb-4 mx-auto opacity-50" />
            <p className="text-lg mb-2">Este recuerdo no tiene fotos todavía.</p>
            <p className="text-sm">Hacé click en "Agregar fotos" arriba a la derecha para empezar a guardarlos.</p>
          </div>
        )}
      </div>

      {/* Lightbox / Modal */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedMedia(null)}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-all"
            onClick={() => setSelectedMedia(null)}
            title="Cerrar"
          >
            <X size={32} />
          </button>
          
          <div 
            className="relative max-w-7xl max-h-screen cursor-default"
            onClick={(e) => e.stopPropagation()} // Prevent clicking media from closing
          >
            {isVideo(selectedMedia.filename) ? (
              <video 
                src={getMediaUrl(selectedMedia.filename)} 
                controls
                autoPlay
                className="max-h-[85vh] max-w-[95vw] rounded-xl shadow-2xl"
              />
            ) : (
              <img 
                src={getMediaUrl(selectedMedia.filename)} 
                alt="Enviado a pantalla completa"
                className="max-h-[85vh] max-w-[95vw] object-contain rounded-xl shadow-2xl"
              />
            )}
          </div>
        </div>
      )}

    </div>
  );
}