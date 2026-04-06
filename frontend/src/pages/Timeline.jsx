import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LayoutGrid, PlayCircle, Loader2 } from 'lucide-react';
import { getAlbums, getMediaUrl } from '../api';

export default function Timeline() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const res = await getAlbums();
      setAlbums(res.data.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isVideo = (filename) => {
    return filename.match(/\.(mp4|webm|mov|ogg)$/i);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-dusty-rose" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <header className="mb-20 text-center relative">
        <h1 className="text-6xl md:text-7xl font-playfair font-bold text-dark-charcoal max-w-2xl mx-auto leading-tight tracking-tight">
          Nuestra <span className="text-dusty-rose italic font-light relative">
            Historia
            <svg className="absolute w-full h-4 -bottom-1 left-0 text-dusty-rose/30" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,10 Q50,20 100,10" fill="none" stroke="currentColor" strokeWidth="4" />
            </svg>
          </span>
        </h1>
        <p className="mt-6 text-gray-500 text-lg max-w-xl mx-auto">
          Los momentos más lindos de nuestra vida, guardados para siempre.
        </p>
      </header>

      {albums.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl mb-4 font-playfair italic">Todavía no hay recuerdos.</p>
          <p>¡Agregá el primero clickeando el botón de abajo!</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line timeline */}
          <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-px bg-dusty-rose/20 transform md:-translate-x-1/2"></div>
          
          <div className="space-y-16 lg:space-y-24">
            {albums.map((album, index) => {
              const isEven = index % 2 === 0;
              const date = new Date(album.date);
              
              // Get max 4 items for preview
              const previews = album.media?.slice(0, 4) || [];
              
              return (
                <div key={album.id} className={`relative flex flex-col md:flex-row group ${isEven ? 'md:flex-row-reverse' : ''} items-center gap-8`}>
                  {/* Timeline Node */}
                  <div className="absolute left-[16px] md:left-1/2 w-3 h-3 rounded-full bg-warm-cream border-2 border-dusty-rose transform md:-translate-x-1/2 shadow-md shadow-dusty-rose/20 z-10 
                                  group-hover:scale-150 group-hover:bg-dusty-rose transition-all duration-300"></div>
                  
                  {/* Date - Desktop ONLY (hides on mobile, shown in card instead) */}
                  <div className={`hidden md:block w-1/2 font-sans font-medium tracking-widest text-sm text-dusty-rose uppercase ${isEven ? 'text-left pl-14' : 'text-right pr-14'}`}>
                    <div className="flex flex-col">
                      <span className="text-xs tracking-widest opacity-60">
                        {date.toLocaleDateString('es-AR', { weekday: 'long' })}
                      </span>
                      <span>
                        {date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="w-full pl-12 md:pl-0 md:w-1/2 sm:pr-0">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-dusty-rose/10 transition-all duration-500 overflow-hidden group-hover:-translate-y-1 relative">
                      
                      {/* Mobile Date string */}
                      <span className="md:hidden text-xs font-semibold text-dusty-rose tracking-wider uppercase mb-2 block">
                        {date.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                      
                      <Link to={`/album/${album.id}`} className="block">
                        <h2 className="text-2xl font-playfair font-bold text-dark-charcoal mb-3 group-hover:text-dusty-rose transition-colors">
                          {album.title}
                        </h2>
                        
                        {album.description && (
                          <p className="text-gray-600 mb-6 text-sm leading-relaxed line-clamp-3">
                            {album.description}
                          </p>
                        )}
                        
                        {/* Media Preview Grid */}
                        {previews.length > 0 ? (
                          <div className={`grid gap-2 ${previews.length === 1 ? 'grid-cols-1' : previews.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                            {previews.map((mediaItem) => (
                              <div key={mediaItem.id} className={`relative rounded-xl overflow-hidden aspect-square ${previews.length === 3 && mediaItem === previews[0] ? 'col-span-2 aspect-[2/1]' : ''}`}>
                                {isVideo(mediaItem.filename) ? (
                                  <>
                                    <video 
                                      src={getMediaUrl(mediaItem.filename)} 
                                      className="w-full h-full object-cover opacity-80"
                                      preload="metadata"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                      <PlayCircle className="w-8 h-8 text-white/90 drop-shadow-md" />
                                    </div>
                                  </>
                                ) : (
                                  <img 
                                    src={getMediaUrl(mediaItem.filename)} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" 
                                    loading="lazy"
                                  />
                                )}
                              </div>
                            ))}
                            {album.media && album.media.length > 4 && (
                              <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 text-xs font-medium text-dark-charcoal transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                <LayoutGrid size={14} className="text-dusty-rose" />
                                +{album.media.length - 4}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-32 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                            Álbum vacío
                          </div>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <Link 
        to="/new"
        className="fixed bottom-8 right-8 w-16 h-16 bg-dusty-rose text-white rounded-full shadow-lg shadow-dusty-rose/30 flex items-center justify-center hover:bg-dusty-rose/90 hover:scale-105 active:scale-95 transition-all z-50 group"
      >
        <span className="absolute right-20 bg-white text-dusty-rose py-1.5 px-3 rounded-lg shadow-md font-medium text-sm w-max opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
          Crear recuerdo
        </span>
        <Plus size={32} strokeWidth={2.5} />
      </Link>
    </div>
  );
}