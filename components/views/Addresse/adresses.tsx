'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Cookies from 'js-cookie';
import { MapPin, Plus, X, Home, Building2, Briefcase, Loader2, Trash2 } from 'lucide-react';

import { axiosService } from '@/lib/axiosService';
import { API } from '@/services/const';
import { useToast } from '@/hooks/use-toast';
import { C, S, alpha } from '@/components/ui/tokens';
import { Screen, Hero, Card, IconBadge, Btn, EmptyState, Modal, Field, Shimmer } from '@/components/ui/kit';

const MapWithNoSSR = dynamic(() => import('@/components/views/Components/map'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100%', display: 'grid', placeItems: 'center', background: 'var(--pm-surface-2)', color: 'var(--pm-muted)', fontSize: '0.85rem' }}>
      در حال بارگذاری نقشه…
    </div>
  ),
});

interface Address {
  _id: string;
  title: string;
  type: 'home' | 'work' | 'other';
  address: string;
  location: { lat: number; lng: number };
}

const TYPES: { value: Address['type']; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'home', label: 'خانه', icon: <Home className="h-4 w-4" />, color: C.green },
  { value: 'work', label: 'محل کار', icon: <Briefcase className="h-4 w-4" />, color: C.statusInfo },
  { value: 'other', label: 'سایر', icon: <Building2 className="h-4 w-4" />, color: C.violet },
];

const typeMeta = (t: Address['type']) => TYPES.find((x) => x.value === t) ?? TYPES[2];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [lookup, setLookup] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({
    title: '',
    type: 'home' as Address['type'],
    address: '',
    location: null as { lat: number; lng: number } | null,
  });
  const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);

  const { toast } = useToast();

  const getAddresses = () => {
    setLoading(true);
    axiosService({ url: API.GET_PROFILE, method: 'get', token: Cookies.get('auth_token') })
      .then((res: any) => {
        setAddresses(res?.data?.user?.addresses || []);
        setLoading(false);
      })
      .catch(() => {
        toast({ variant: 'destructive', title: 'ناموفق', description: 'دریافت آدرس‌ها انجام نشد.' });
        setLoading(false);
      });
  };

  useEffect(() => { getAddresses(); }, []);

  const handleAddAddress = () => {
    if (!newAddress.title || !newAddress.address || !newAddress.location) return;
    setBusy(true);
    axiosService({
      url: API.ADD_ADDRESS,
      method: 'post',
      token: Cookies.get('auth_token'),
      body: {
        title: newAddress.title,
        type: newAddress.type,
        address: newAddress.address,
        location: newAddress.location,
      },
    })
      .then((res: any) => {
        setAddresses(res?.data?.addresses || []);
        toast({ variant: 'success', title: 'ثبت شد', description: 'آدرس جدید اضافه شد.' });
        setIsModalOpen(false);
        setNewAddress({ title: '', type: 'home', address: '', location: null });
      })
      .catch(() => {
        toast({ variant: 'destructive', title: 'خطا', description: 'افزودن آدرس انجام نشد.' });
      })
      .finally(() => setBusy(false));
  };

  const handleDeleteAddress = (id: string) => {
    setDeletingId(id);
    axiosService({ url: `${API.DELETE_ADDRESS}?addressId=${id}`, method: 'delete', token: Cookies.get('auth_token') })
      .then((res: any) => {
        setAddresses(res?.data?.addresses || []);
        toast({ variant: 'success', title: 'حذف شد', description: 'آدرس حذف شد.' });
      })
      .catch(() => {
        toast({ variant: 'destructive', title: 'خطا', description: 'حذف آدرس انجام نشد.' });
      })
      .finally(() => setDeletingId(null));
  };

  const handleLocationSelect = async (latlng: { lat: number; lng: number }) => {
    setNewAddress((prev) => ({ ...prev, location: latlng }));
    setLookup(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json&accept-language=fa`,
      );
      const data = await response.json();
      setNewAddress((prev) => ({ ...prev, address: data.display_name || 'آدرس یافت نشد' }));
    } catch {
      setNewAddress((prev) => ({ ...prev, address: 'خطا در دریافت آدرس' }));
    } finally {
      setLookup(false);
    }
  };

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewAddress((prev) => ({ ...prev, address: value }));
    if (value.length > 2) {
      setLookup(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&limit=5&countrycodes=ir&accept-language=fa`,
        );
        setSuggestions(await response.json());
      } catch {
        setSuggestions([]);
      } finally {
        setLookup(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (s: { display_name: string; lat: string; lon: string }) => {
    setNewAddress((prev) => ({
      ...prev,
      location: { lat: parseFloat(s.lat), lng: parseFloat(s.lon) },
      address: s.display_name,
    }));
    setSuggestions([]);
  };

  return (
    <>
      <Screen>
        <Hero
          icon={<MapPin className="h-6 w-6" />}
          title="آدرس‌های من"
          sub="آدرس‌های ذخیره‌شده، ثبت درخواست بعدی را کوتاه‌تر می‌کند."
          aside={
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontFamily: 'inherit',
                background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.3)',
                color: C.onHero, padding: '11px 17px', borderRadius: S.rPill,
                fontSize: S.sm, fontWeight: 800, whiteSpace: 'nowrap',
              }}
            >
              <Plus className="h-4 w-4" />
              آدرس جدید
            </button>
          }
        />

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
            {[0, 1].map((i) => <Shimmer key={i} height={104} />)}
          </div>
        ) : addresses.length === 0 ? (
          <EmptyState
            icon={<MapPin className="h-6 w-6" />}
            title="هنوز آدرسی ثبت نکرده‌اید"
            sub="یک آدرس ذخیره کنید تا در ثبت درخواست فقط انتخابش کنید."
            action={
              <div style={{ marginTop: S.s2 }}>
                <Btn onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  افزودن آدرس
                </Btn>
              </div>
            }
          />
        ) : (
          <div style={{ display: 'grid', gap: S.s3, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {addresses.map((address, i) => {
              const meta = typeMeta(address.type);
              return (
                <div key={address._id} className="pm-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}>
                  <Card accent={meta.color} style={{ height: '100%' }}>
                    <div style={{ padding: `${S.s4}px` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: S.s3 }}>
                        <IconBadge color={meta.color}>{meta.icon}</IconBadge>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: S.base, fontWeight: 800, color: C.textStrong }}>{address.title}</p>
                          <p style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted }}>{meta.label}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(address._id)}
                          aria-label="حذف آدرس"
                          disabled={deletingId === address._id}
                          style={{
                            flexShrink: 0, cursor: 'pointer', background: 'transparent',
                            border: `1px solid ${C.border}`, borderRadius: S.rPill, padding: 8,
                            color: C.statusDanger, display: 'grid', placeItems: 'center',
                          }}
                        >
                          {deletingId === address._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>

                      <p
                        style={{
                          margin: `${S.s3}px 0 0`, paddingTop: S.s3, borderTop: `1px dashed ${C.border}`,
                          fontSize: S.xs, color: C.muted, lineHeight: 1.9, display: 'flex', gap: 6,
                        }}
                      >
                        <MapPin className="h-3.5 w-3.5" style={{ flexShrink: 0, marginTop: 3 }} />
                        <span style={{ overflowWrap: 'anywhere' }}>{address.address}</span>
                      </p>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </Screen>

      {isModalOpen && (
        <Modal wide onClose={() => setIsModalOpen(false)}>
          <div style={{ padding: S.s5, display: 'flex', flexDirection: 'column', gap: S.s4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: S.s3 }}>
              <p style={{ margin: 0, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>افزودن آدرس</p>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="بستن"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.muted, padding: 4 }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <Field label="عنوان آدرس">
              <input
                className="pm-field"
                value={newAddress.title}
                onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                placeholder="مثال: خانه، محل کار"
              />
            </Field>

            <div>
              <p style={{ margin: `0 0 ${S.s2}px`, fontSize: S.sm, fontWeight: 700, color: C.text }}>نوع آدرس</p>
              <div style={{ display: 'grid', gap: S.s2, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {TYPES.map((t) => {
                  const on = newAddress.type === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setNewAddress({ ...newAddress, type: t.value })}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: `${S.s3}px 6px`, borderRadius: S.r2, cursor: 'pointer', fontFamily: 'inherit',
                        fontSize: S.xs, fontWeight: 800,
                        background: on ? alpha(t.color, 12) : C.surface2,
                        border: `1.5px solid ${on ? t.color : C.border}`,
                        color: on ? t.color : C.text,
                      }}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p style={{ margin: `0 0 ${S.s2}px`, fontSize: S.sm, fontWeight: 700, color: C.text }}>موقعیت روی نقشه</p>
              <div style={{ height: 250, borderRadius: S.r2, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                <MapWithNoSSR
                  center={newAddress.location || { lat: 35.6892, lng: 51.389 }}
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={newAddress.location}
                />
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <Field label="آدرس دقیق">
                <input
                  className="pm-field"
                  value={newAddress.address}
                  onChange={handleAddressChange}
                  placeholder="جستجوی آدرس…"
                />
              </Field>
              {lookup && (
                <span style={{ position: 'absolute', insetInlineStart: 14, bottom: 15 }}>
                  <Loader2 className="h-4 w-4 animate-spin" style={{ color: C.green }} />
                </span>
              )}
              {suggestions.length > 0 && (
                <ul
                  style={{
                    position: 'absolute', zIndex: 20, insetInline: 0, marginTop: 6, listStyle: 'none', padding: 6,
                    maxHeight: 170, overflowY: 'auto', background: C.surface,
                    border: `1px solid ${C.border}`, borderRadius: S.r2, boxShadow: C.shadowLift,
                  }}
                >
                  {suggestions.map((s, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => handleSuggestionClick(s)}
                        style={{
                          display: 'block', width: '100%', textAlign: 'start', cursor: 'pointer',
                          padding: `${S.s2}px ${S.s3}px`, borderRadius: S.r1, background: 'transparent',
                          border: 'none', fontFamily: 'inherit', fontSize: S.xs, color: C.text, lineHeight: 1.8,
                        }}
                      >
                        {s.display_name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ display: 'flex', gap: S.s2 }}>
              <Btn full onClick={handleAddAddress} disabled={busy || !newAddress.title || !newAddress.address || !newAddress.location}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                ثبت آدرس
              </Btn>
              <Btn variant="ghost" onClick={() => setIsModalOpen(false)}>انصراف</Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
