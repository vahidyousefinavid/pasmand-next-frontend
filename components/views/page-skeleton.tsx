import { S } from '@/components/ui/tokens';
import { Shimmer } from '@/components/ui/kit';

/**
 * What a `force-dynamic` route shows while the server is still rendering it.
 *
 * Seven public routes render per request, and with no `loading.tsx` the App
 * Router had nothing to stream in the meantime: a tap left the previous page on
 * screen, motionless, until the new one was ready. The route progress bar was
 * the only sign anything was happening. This is deliberately the same Shimmer
 * the signed-in screens already use, so a wait looks the same everywhere.
 */
export default function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="ss-wrap" style={{ paddingTop: S.s5, paddingBottom: S.s6, display: 'grid', gap: S.s4 }}>
      <Shimmer height={34} radius={10} />
      <Shimmer height={18} radius={8} />
      <div style={{ display: 'grid', gap: S.s3, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))' }}>
        {Array.from({ length: rows }, (_, i) => (
          <Shimmer key={i} height={132} />
        ))}
      </div>
    </div>
  );
}
