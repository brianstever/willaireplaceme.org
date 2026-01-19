export default function FaviconPreview() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center gap-16 p-8">
      {/* Large preview - 512x512 for easy screenshot */}
      <div className="flex flex-col items-center gap-4">
        <div 
          className="relative bg-[#0a0a0a] rounded-2xl overflow-hidden"
          style={{ width: 512, height: 512 }}
        >
          <svg 
            viewBox="0 0 512 512" 
            className="w-full h-full"
          >
            {/* Steep zig-zag downward trend - Consistent Slopes */}
            <g transform="translate(0, 0)">
              <path
                d="M 80 100 
                   L 168 236
                   L 256 160
                   L 344 296
                   L 432 432"
                fill="none"
                stroke="#dc2626"
                strokeWidth="48"
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeMiterlimit="10"
              />
            </g>
          </svg>
        </div>
        <span className="font-mono text-sm text-muted-foreground">512×512</span>
      </div>

      {/* Actual size previews */}
      <div className="flex flex-col gap-8">
        {/* 32x32 preview */}
        <div className="flex items-center gap-4">
          <div 
            className="relative bg-[#0a0a0a] rounded overflow-hidden"
            style={{ width: 32, height: 32 }}
          >
            <svg viewBox="0 0 512 512" className="w-full h-full">
              <g transform="translate(0, 0)">
                <path
                  d="M 80 100 L 168 236 L 256 160 L 344 296 L 432 432"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="48"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeMiterlimit="10"
                />
              </g>
            </svg>
          </div>
          <span className="font-mono text-xs text-muted-foreground">32×32 (browser tab)</span>
        </div>

        {/* 16x16 preview */}
        <div className="flex items-center gap-4">
          <div 
            className="relative bg-[#0a0a0a] rounded-sm overflow-hidden"
            style={{ width: 16, height: 16 }}
          >
            <svg viewBox="0 0 512 512" className="w-full h-full">
              <g transform="translate(0, 0)">
                <path
                  d="M 80 100 L 168 236 L 256 160 L 344 296 L 432 432"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="48"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeMiterlimit="10"
                />
              </g>
            </svg>
          </div>
          <span className="font-mono text-xs text-muted-foreground">16×16 (tiny)</span>
        </div>

        {/* On dark background simulation */}
        <div className="flex items-center gap-4 bg-[#1a1a1a] p-3 rounded">
          <div 
            className="relative bg-[#0a0a0a] rounded overflow-hidden"
            style={{ width: 32, height: 32 }}
          >
            <svg viewBox="0 0 512 512" className="w-full h-full">
              <g transform="translate(0, 0)">
                <path
                  d="M 80 100 L 168 236 L 256 160 L 344 296 L 432 432"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="48"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeMiterlimit="10"
                />
              </g>
            </svg>
          </div>
          <span className="font-mono text-xs text-muted-foreground">dark tab bar</span>
        </div>

        {/* On light background simulation */}
        <div className="flex items-center gap-4 bg-[#e5e5e5] p-3 rounded">
          <div 
            className="relative bg-[#0a0a0a] rounded overflow-hidden"
            style={{ width: 32, height: 32 }}
          >
            <svg viewBox="0 0 512 512" className="w-full h-full">
              <g transform="translate(0, 0)">
                <path
                  d="M 80 100 L 168 236 L 256 160 L 344 296 L 432 432"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="48"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeMiterlimit="10"
                />
              </g>
            </svg>
          </div>
          <span className="font-mono text-xs text-[#333]">light tab bar</span>
        </div>
      </div>
    </div>
  );
}
