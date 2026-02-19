import { useRef, useEffect, useState } from 'react';
import { Linkedin, Mail, MessageSquare, X } from 'lucide-react';

export default function Testimonials() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedReview, setSelectedReview] = useState<number | null>(null);
  const animationRef = useRef<number>();

  const reviews = [
    {
      name: "@placeholder_sarah",
      role: "CEO, TechStart Inc",
      link: "https://linkedin.com",
      icon: "linkedin",
      review: "HaloVision transformed our customer service with their AI agents. Response times dropped by 80% and customer satisfaction is at an all-time high. The implementation was seamless and the results were immediate.",
    },
    {
      name: "@placeholder_michael",
      role: "Founder, GrowthLab",
      link: "mailto:example@email.com",
      icon: "mail",
      review: "The automation solutions they built for us freed up our team to focus on strategic work. ROI was evident within the first month. Highly recommend their services to anyone looking to scale.",
    },
    {
      name: "@placeholder_emma",
      role: "Director, SalesForce Pro",
      link: "https://teams.microsoft.com",
      icon: "teams",
      review: "Their lead generation AI is incredible. We're now capturing and qualifying leads 24/7 without any manual effort. Our conversion rates have never been better.",
    },
    {
      name: "@placeholder_david",
      role: "Manager, CloudSync",
      link: "https://twitter.com",
      icon: "twitter",
      review: "Working with HaloVision was seamless. They understood our needs and delivered a custom solution that exceeded expectations. The team is responsive and professional.",
    },
    {
      name: "@placeholder_lisa",
      role: "COO, FinTech Solutions",
      link: "https://facebook.com",
      icon: "facebook",
      review: "The AI agents handle our appointment scheduling flawlessly. No more back-and-forth emails or missed bookings. Our efficiency has increased dramatically.",
    },
    {
      name: "@placeholder_james",
      role: "Founder, MarketEdge",
      link: "https://linkedin.com",
      icon: "linkedin",
      review: "Their marketing automation saved us countless hours. Campaigns run smoothly and conversions have increased by 45%. Best investment we've made this year.",
    },
    {
      name: "@placeholder_sophia",
      role: "CEO, HealthPlus",
      link: "https://twitter.com",
      icon: "twitter",
      review: "Patient follow-ups are now automated and personalized. Our retention rate improved significantly since implementing their solution. The system works perfectly.",
    },
    {
      name: "@placeholder_robert",
      role: "Director, RetailPro",
      link: "https://teams.microsoft.com",
      icon: "teams",
      review: "The review management system they built helps us respond to all customer feedback promptly. Our online reputation has never been better and we're seeing great results.",
    },
    {
      name: "@placeholder_amanda",
      role: "Manager, Creative Studio",
      link: "https://facebook.com",
      icon: "facebook",
      review: "HaloVision's content creation AI assists our team beautifully. We're producing twice as much quality content in half the time. The quality remains consistently high.",
    },
    {
      name: "@placeholder_chris",
      role: "Founder, DataDrive",
      link: "https://linkedin.com",
      icon: "linkedin",
      review: "Their data analysis agents provide insights we never knew we needed. Decision-making is now backed by real-time intelligence. Game changer for our business.",
    },
  ];

  const infiniteReviews = [...reviews, ...reviews, ...reviews];

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const autoScroll = () => {
      if (!isPaused && container) {
        container.scrollLeft += 0.92;
        const maxScroll = container.scrollWidth / 3;
        if (container.scrollLeft >= maxScroll) {
          container.scrollLeft = 0;
        }
      }
      animationRef.current = requestAnimationFrame(autoScroll);
    };

    animationRef.current = requestAnimationFrame(autoScroll);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused]);

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'mail':
        return <Mail className="w-4 h-4" />;
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'twitter':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case 'facebook':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      case 'teams':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.625 8.127v7.746a1.127 1.127 0 01-1.127 1.127h-2.535V9.254h2.535c.622 0 1.127.505 1.127 1.127zM8.746 3.375h3.38v4.507H8.746zm0 5.634h3.38v11.615H8.746zM3.375 9.01h4.245v8.238a.752.752 0 01-.752.752H3.375zm10.758 8.615h2.113v-3.38h1.69V12.75h-1.69v-1.127h1.69v-1.69h-3.803zm-7.605-6.61a1.69 1.69 0 100-3.38 1.69 1.69 0 000 3.38z" />
          </svg>
        );
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const handleCardClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setSelectedReview(index);
  };

  const handleNameClick = (e: React.MouseEvent, link: string) => {
    e.stopPropagation();
    window.open(link, '_blank');
  };

  const closeModal = () => {
    setSelectedReview(null);
  };

  return (
    <section className="relative py-12 md:py-16">
      <div className="absolute inset-0 bg-black backdrop-blur-sm pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-white">What People Say</h3>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute left-0 top-0 h-full w-24 pointer-events-none bg-gradient-to-r from-black/80 to-transparent z-20" />
          <div className="absolute right-0 top-0 h-full w-24 pointer-events-none bg-gradient-to-l from-black/80 to-transparent z-20" />

          <div
            ref={scrollContainerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-4 overflow-x-auto scrollbar-hide py-4 justify-start relative z-10"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: 'grab' }}
          >
            {infiniteReviews.map((review, index) => (
              <div
                key={index}
                onClick={(e) => handleCardClick(e, index % reviews.length)}
                className="flex-shrink-0 w-[320px] md:w-[380px] backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all text-left cursor-pointer"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <p className="text-gray-200 text-sm md:text-base leading-relaxed mb-3 line-clamp-3">
                  {review.review}
                </p>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <a href={review.link} onClick={(e) => handleNameClick(e, review.link)} className="text-red-500 hover:text-red-400 font-medium text-xs transition-colors block truncate">
                      {review.name}
                    </a>
                    <p className="text-gray-400 text-[10px] truncate">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedReview !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-8 max-w-2xl w-full relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex-shrink-0" />
              <div className="flex-1">
                <a href={reviews[selectedReview].link} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 font-bold text-xl mb-1 transition-colors inline-block">
                  {reviews[selectedReview].name}
                </a>
                <p className="text-gray-300 text-sm">{reviews[selectedReview].role}</p>
              </div>
              <div className="text-blue-400 hover:text-blue-300 flex-shrink-0">
                {getIcon(reviews[selectedReview].icon)}
              </div>
            </div>

            <p className="text-gray-200 text-base leading-relaxed">
              {reviews[selectedReview].review}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}