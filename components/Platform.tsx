// components/Platform.tsx
type PlatformProps = { x: number; y: number; w: number; h: number };

export default function Platform({ x, y, w, h }: PlatformProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        background: "linear-gradient(180deg, #C9A876 0%, #A8824F 100%)",
        borderRadius: 6,
        boxShadow: "0 3px 0 rgba(0,0,0,0.2)",
      }}
    />
  );
}
