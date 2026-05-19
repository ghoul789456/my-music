import { Skeleton } from "@heroui/react";

interface AnimationTypesProps {
  isRound?: boolean;
  count?: number;
}

export default function AnimationTypes({ isRound = false, count = 6 }: AnimationTypesProps) {
  return (
    <div style={{
      display: 'grid',
      gridAutoFlow: 'column',
      gridAutoColumns: '15.3%',
      gap: '1rem',
      overflow: 'hidden',
      padding: '10px'
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ padding: '10px' }}>
          {/* 图片占位，1:1 比例 */}
          <Skeleton
            animationType="shimmer"
            className={isRound ? 'rounded-full' : 'rounded-xl'}
            style={{ width: '100%', aspectRatio: '1 / 1', display: 'block' }}
          />
          {/* songName */}
          <Skeleton animationType="shimmer" className="rounded-lg" style={{ height: '1rem', marginTop: '0.5rem', width: '80%' }} />
          {/* singerName */}
          <Skeleton animationType="shimmer" className="rounded-lg" style={{ height: '0.8rem', marginTop: '0.3rem', width: '60%' }} />
        </div>
      ))}
    </div>
  );
}