import {Spinner} from '@heroui/react'
export default function PageLoading() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Spinner size="lg" />
    </div>
  );
}