import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, UploadCloud, X, HelpCircle, AlertCircle } from 'lucide-react';
import { createAlbum, uploadMedia } from '../api';
import heic2any from 'heic2any';

export default function NewAlbum() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  const processFiles = async (newFiles) => {
    setLoading(true);
    const processedFiles = [];
    for (let file of newFiles) {
      if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        try {
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
          });
          const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          const convertedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
            type: 'image/jpeg'
          });
          processedFiles.push(convertedFile);
        } catch (err) {
          console.error("Error convirtiendo HEIC:", err);
          setError("No se pudo procesar una imagen HEIC.");
          processedFiles.push(file);
        }
      } else {
        processedFiles.push(file);
      }
    }
    setFiles((prev) => [...prev, ...processedFiles]);
    setLoading(false);
  };

  const handleFileChange = async (e) => {
    const newFiles = Array.from(e.target.files);
    await processFiles(newFiles);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isVideo = (file) => file.type.startsWith('video/');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const albumRes = await createAlbum({ title, date, description });
      const albumId = albumRes.data.id;

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });
        
        await uploadMedia(albumId, formData);
      }

      navigate(`/album/${albumId}`);
    } catch (err) {
      console.error(err);
      setError('Hubo un error al crear el álbum. Por favor intenta otra vez.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      await processFiles(newFiles);
    }
  };

  return (
    <div className="min-h-screen bg-warm-cream py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-xl shadow-dusty-rose/5 border border-dusty-rose/10 overflow-hidden">
        
        {/* Header */}
        <div className="border-b border-gray-100 px-8 py-6 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <Link to="/" className="text-gray-400 hover:text-dusty-rose transition-colors p-2 -ml-2 rounded-full hover:bg-warm-cream">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-2xl font-playfair font-bold text-dark-charcoal text-center flex-1 pr-6">
            Nuevo recuerdo <sup className="text-dusty-rose">*</sup>
          </h1>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
           
          {error && (
            <div className="bg-red-50 text-red-600 p-4 flex gap-3 items-center rounded-xl border border-red-100">
               <AlertCircle className="w-5 h-5" />
               <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 tracking-wide uppercase">
                Título del Álbum <span className="text-dusty-rose">*</span>
              </label>
              <input
                id="title"
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nuestro viaje a..."
                className="w-full bg-warm-cream/30 px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-dusty-rose/50 focus:border-dusty-rose transition-all outline-none text-dark-charcoal placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 tracking-wide uppercase">
                Fecha del recuerdo <span className="text-dusty-rose">*</span>
              </label>
              <input
                id="date"
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-warm-cream/30 px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-dusty-rose/50 focus:border-dusty-rose transition-all outline-none text-dark-charcoal"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 tracking-wide uppercase">
              Descripción <span className="text-gray-400 text-xs font-normal normal-case ml-2">(Opcional)</span>
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Unas palabras sobre este día especial..."
              className="resize-none w-full bg-warm-cream/30 px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-dusty-rose/50 focus:border-dusty-rose transition-all outline-none text-dark-charcoal placeholder-gray-400"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 tracking-wide uppercase">
                Fotos y Videos
              </label>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md border flex items-center gap-1.5 cursor-help" title="Formatos: JPG, PNG, WEBP, HEIC, MP4, MOV">
                <HelpCircle size={14}/> Formatos
              </span>
            </div>

            {/* Drag & Drop Zone */}
            <div 
              className={`w-full aspect-video md:aspect-[3/1] max-h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all bg-warm-cream/20 
                        ${files.length > 0 ? 'border-dusty-rose bg-dusty-rose/5' : 'border-gray-300 hover:border-dusty-rose/70 hover:bg-warm-cream'}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,video/*,.heic,.heif"
              />
              <div className="w-16 h-16 mb-4 bg-white shadow-sm shadow-dusty-rose/10 rounded-full flex items-center justify-center pointer-events-none">
                <UploadCloud className="w-8 h-8 text-dusty-rose" />
              </div>
              <p className="text-gray-600 font-medium md:text-lg">
                Arrastrá archivos acá <span className="hidden sm:inline">o hacé click para buscar</span>
              </p>
              <p className="text-sm text-gray-400 mt-2 max-w-[20ch]">
                {files.length === 0 ? 'No seleccionaste archivos' : `${files.length} archivo(s) listos para subir`}
              </p>
            </div>

            {/* Preview Grid */}
            {files.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                {files.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    {isVideo(file) ? (
                      <video
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover opacity-80"
                        muted
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                        className="bg-white/20 hover:bg-red-500 rounded-full p-2 backdrop-blur text-white transition-colors border border-white/30 hover:border-red-500"
                        title="Quitar archivo"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3.5 text-gray-500 hover:text-gray-800 font-medium transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !title || !date}
              className="ml-4 px-8 py-3.5 bg-dusty-rose text-white rounded-xl font-medium hover:bg-dusty-rose/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-dusty-rose/20 transition-all hover:shadow-lg focus:ring-4 focus:ring-dusty-rose/30"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Subiendo...
                </span>
              ) : 'Guardar recuerdo'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}