import { Skeleton } from "@heroui/react";

export default function AnimationTypes() {
   return (
    <div style={{ padding: '10px' }}>
      {/* 重复三块，模拟三个 SingerCard 区域 */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ marginBottom: '2rem' }}>
          {/* 标题占位 */}
          <Skeleton animationType="shimmer" className="rounded-lg"
            style={{ height: '1.2rem', width: '6rem', marginBottom: '1rem' }} />
          {/* 卡片行 */}
          <div style={{
            display: 'grid',
            gridAutoFlow: 'column',
            gridAutoColumns: '15.3%',
            gap: '1rem',
            overflow: 'hidden',
          }}>
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} style={{ padding: '10px' }}>
                <Skeleton animationType="shimmer" className="rounded-xl"
                  style={{ width: '100%', aspectRatio: '1/1' }} />
                <Skeleton animationType="shimmer" className="rounded-lg"
                  style={{ height: '1rem', marginTop: '0.5rem', width: '80%' }} />
                <Skeleton animationType="shimmer" className="rounded-lg"
                  style={{ height: '0.8rem', marginTop: '0.3rem', width: '60%' }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}