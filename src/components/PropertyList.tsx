import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Bed, Bath, Square, X, Check, Loader2, Play, Video, Search, ChevronDown, Filter } from 'lucide-react';
import { getProperties, Property, PROPERTY_TYPES as CATEGORIES } from '../services/propertyService';

const PROPERTY_TYPES = ['all', ...CATEGORIES];

export default function PropertyList({ id }: { id?: string }) {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Real listings only — an empty DB shows the "coming soon" state
        // instead of demo data.
        setProperties(await getProperties());
      } catch (error) {
        console.error("Error fetching properties:", error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return properties.filter(property => {
      const matchesSearch =
        !query ||
        (property.title || '').toLowerCase().includes(query) ||
        (property.location || '').toLowerCase().includes(query) ||
        (property.description || '').toLowerCase().includes(query) ||
        (property.type || '').toLowerCase().includes(query);

      const matchesType = selectedType === 'all' || property.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [properties, searchQuery, selectedType]);

  const groupedProperties = useMemo(() => {
    const groups: Record<string, Property[]> = {};
    filteredProperties.forEach(p => {
      const type = p.type || 'other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(p);
    });
    return groups;
  }, [filteredProperties]);

  if (loading) {
    return (
      <div className="py-32 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <section id={id} className="py-32 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8 text-neutral-100">
        <div className="max-w-2xl">
          <span className="text-gold uppercase tracking-[0.3em] text-[10px] mb-4 block font-medium">{t('curated_listings')}</span>
          <h2 className="text-5xl md:text-7xl font-serif leading-tight">{t('properties')}</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-gold transition-colors" />
            <input 
              type="text" 
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-12 pr-6 text-sm focus:outline-none focus:border-gold/50 transition-all placeholder:text-white/20"
            />
          </div>
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-gold transition-colors" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="appearance-none w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:border-gold/50 transition-all cursor-pointer capitalize"
            >
              {PROPERTY_TYPES.map(type => (
                <option key={type} value={type} className="bg-dark text-white uppercase tracking-widest text-[10px]">
                  {t(type)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="space-y-32">
        {Object.entries(groupedProperties).length > 0 ? (
          Object.entries(groupedProperties).map(([type, typeProperties], groupIndex) => (
            <div key={type} className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="flex items-center gap-6 mb-12">
                <h3 className="text-xs uppercase tracking-[0.5em] font-bold text-gold whitespace-nowrap">{t(type)}</h3>
                <div className="h-px bg-white/10 w-full" />
                <span className="text-[10px] text-white/30 font-mono italic">({typeProperties.length})</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
                {typeProperties.map((property, index) => (
                  <motion.div
                    key={property.id || `${type}-${index}`}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedProperty(property)}
                    onMouseEnter={() => setHoveredProperty(property.id || `${type}-${index}`)}
                    onMouseLeave={() => setHoveredProperty(null)}
                  >
                    {/* ... (rest of property card UI) ... */}
                    <div className="relative overflow-hidden rounded-2xl mb-8 aspect-[4/5] shadow-2xl">
                      <motion.img 
                        src={property.image} 
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent opacity-80 z-20" />
                      
                      <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
                        <span className="bg-gold text-dark text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-bold shadow-lg">
                          {t('featured')}
                        </span>
                        {property.videoUrl && (
                          <span className="bg-dark/60 backdrop-blur-md text-white text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1.5">
                            <Video className="w-3 h-3 text-gold" />
                            Video
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-8 left-8 right-8 z-30 flex justify-between items-end">
                        <div className="text-neutral-100">
                          <div className="text-gold font-serif text-3xl mb-1">{property.price}</div>
                          <div className="text-white/60 text-[10px] uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {property.location}
                          </div>
                        </div>
                        {property.videoUrl && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProperty(property);
                            }}
                            className="bg-gold text-dark p-3 rounded-full shadow-2xl group/btn transition-all duration-300 hover:bg-white flex items-center gap-2"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span className="text-[10px] uppercase tracking-widest font-bold pr-2 hidden group-hover/btn:block transition-all">{t('watch_video')}</span>
                          </motion.button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-6 px-2 text-neutral-100">
                      <h3 className="text-3xl font-serif group-hover:text-gold transition-colors duration-500 leading-tight">
                        {property.title}
                      </h3>
                      
                      <div className="flex items-center justify-between border-t border-white/5 pt-6">
                        <div className="flex items-center gap-6 text-white/40 text-xs">
                          <div className="flex items-center gap-2.5">
                            <Bed className="w-4 h-4 text-gold/50" />
                            <span className="tracking-widest">{property.beds} <span className="text-[10px] opacity-50">{t('bedrooms')}</span></span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <Bed className="w-4 h-4 text-gold/50" />
                            <span className="tracking-widest">{property.baths} <span className="text-[10px] opacity-50">{t('bathrooms')}</span></span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <Square className="w-4 h-4 text-gold/50" />
                            <span className="tracking-widest">{property.sqft} <span className="text-[10px] opacity-50">{t('area')}</span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <p className="text-white/40 text-lg font-light italic">{t('no_properties')}</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedType('all'); }}
              className="mt-6 text-gold underline underline-offset-8 text-xs uppercase tracking-widest font-bold hover:text-white transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Property Detail Modal */}
      <AnimatePresence>
        {selectedProperty && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProperty(null)}
              className="absolute inset-0 bg-dark/95 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl max-h-[90vh] glass rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl text-neutral-100"
            >
              <button 
                onClick={() => setSelectedProperty(null)}
                className="absolute top-6 right-6 z-10 bg-dark/50 hover:bg-gold p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Left: Image Gallery */}
              <div className="w-full md:w-1/2 h-64 md:h-auto overflow-y-auto scrollbar-hide space-y-2 p-2 bg-dark/50">
                <img 
                  src={selectedProperty.image} 
                  alt={selectedProperty.title}
                  className="w-full aspect-[4/3] object-cover rounded-2xl"
                  referrerPolicy="no-referrer"
                />
                {selectedProperty.gallery?.map((img, i) => (
                  <img 
                    key={i}
                    src={img} 
                    alt={`${selectedProperty.title} gallery ${i}`}
                    className="w-full aspect-[4/3] object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>

              {/* Right: Details */}
              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
                <div className="mb-8">
                  <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest mb-4">
                    <MapPin className="w-3 h-3" />
                    {selectedProperty.location}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif mb-4 uppercase">{selectedProperty.title}</h2>
                  <div className="text-2xl text-gold font-serif">{selectedProperty.price}</div>
                </div>

                <div className="flex items-center gap-8 text-white/60 text-sm mb-10 pb-10 border-b border-white/10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-white/30">{t('bedrooms')}</span>
                    <div className="flex items-center gap-2 text-white">
                      <Bed className="w-4 h-4" />
                      <span className="text-lg">{selectedProperty.beds}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-white/30">{t('bathrooms')}</span>
                    <div className="flex items-center gap-2 text-white">
                      <Bed className="w-4 h-4" />
                      <span className="text-lg">{selectedProperty.baths}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-white/30">{t('area')}</span>
                    <div className="flex items-center gap-2 text-white">
                      <Square className="w-4 h-4" />
                      <span className="text-lg">{selectedProperty.sqft} <span className="text-sm text-white/40">m²</span></span>
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-lg font-serif mb-4 text-gold">{t('description')}</h3>
                  <p className="text-white/70 leading-relaxed font-light">
                    {selectedProperty.description}
                  </p>
                </div>

                <div className="mb-10">
                  <h3 className="text-lg font-serif mb-4 text-gold">{t('amenities')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedProperty.amenities?.map((amenity, i) => (
                      <div key={i} className="flex items-center gap-2 text-white/60 text-sm">
                        <Check className="w-4 h-4 text-gold" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedProperty.videoUrl && (
                  <div className="mb-10">
                    <h3 className="text-lg font-serif mb-4 text-gold">{t('property_video')}</h3>
                    <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
                      {selectedProperty.videoUrl.includes('youtube.com') || selectedProperty.videoUrl.includes('youtu.be') ? (
                        <iframe 
                          src={selectedProperty.videoUrl.includes('youtu.be') 
                            ? `https://www.youtube.com/embed/${selectedProperty.videoUrl.split('/').pop()}`
                            : selectedProperty.videoUrl.replace('watch?v=', 'embed/')} 
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        />
                      ) : (
                        <video 
                          src={selectedProperty.videoUrl} 
                          controls 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                )}

                <button className="w-full bg-gold text-dark py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors">
                  {t('inquiry')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
