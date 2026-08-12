'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Cookies from 'js-cookie';
import {
  ArrowUpIcon, ArrowDownIcon, Package2Icon, BanknoteIcon, ScaleIcon,
  Pencil, X, Loader2, MapPin, CalendarClock, FileClock, PackagePlus, RotateCw,
} from 'lucide-react';

import { axiosService } from '@/lib/axiosService';
import { API } from '@/services/const';
import { toast } from '@/hooks/use-toast';
import { WASTE_TYPES, wasteMeta } from '@/lib/wasteTypes';
import { C, S, alpha, STATUS_THEME, fa, type RequestStatus } from '@/components/ui/tokens';
import { Screen, Hero, Card, IconBadge, Btn, Stat, StepRail, EmptyState, Modal, type Step } from '@/components/ui/kit';

const MapWithNoSSR = dynamic(() => import('@/components/views/Components/map'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100%', display: 'grid', placeItems: 'center', background: 'var(--pm-surface-2)', color: 'var(--pm-muted)', fontSize: '0.85rem' }}>
      در حال بارگذاری نقشه…
    </div>
  ),
});

interface HistoryItem {
  _id: string;
  date: string;
  items: {
    material: string;
    category: string;
    pricePerUnit: number;
    quantity: number;
    title: string;
    unit: string;
    description: string;
    _id: string;
  }[];
  status: RequestStatus;
  totalPrice: number;
  location: { address: string; lat: number; lng: number; _id: string };
  wasteType?: string;
  timeSlot: { date: string; time: string; _id: string };
  collector?: string;
  user: string;
  __v: number;
}

const TIME_SLOTS = ['۹:۰۰ - ۱۱:۰۰', '۱۱:۰۰ - ۱۳:۰۰', '۱۴:۰۰ - ۱۶:۰۰', '۱۶:۰۰ - ۱۸:۰۰'];

/**
 * The life of a request, as four stages.
 *
 * This is the same rail the wizard ends on, and it is the point of this screen:
 * a status chip says "در حال جمع‌آوری" and stops there, while the rail also says
 * what already happened and what is still owed to the citizen.
 */
const STAGES: Step[] = [
  { key: 'sent', title: 'ثبت درخواست' },
  { key: 'approve', title: 'بررسی و تأیید' },
  { key: 'collect', title: 'جمع‌آوری در محل' },
  { key: 'settle', title: 'توزین و تسویه' },
];

/** Where on the rail a status sits. `completed` is past the last stage. */
function stageOf(status: RequestStatus): number {
  switch (status) {
    case 'pending': return 1;
    case 'collecting': return 2;
    case 'completed': return STAGES.length;
    case 'canceled': return 1;
  }
}

export default function HistoryPage() {
  const [sortBy, setSortBy] = useState<'date' | 'totalPrice'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [requestsItems, setRequestsItems] = useState<HistoryItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | RequestStatus>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HistoryItem | null>(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    address: '',
    location: null as { lat: number; lng: number } | null,
    date: '',
    time: '',
    wasteType: '' as any,
  });
  const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);

  const getRequests = () => {
    setLoading(true);
    axiosService({ url: API.USER_REQUESTS, method: 'get', token: Cookies.get('auth_token') })
      .then((res: any) => {
        setRequestsItems(res?.data?.requests || []);
        setLoading(false);
      })
      .catch(() => {
        toast({ variant: 'destructive', title: 'ناموفق', description: 'دریافت سوابق انجام نشد؛ صفحه را دوباره باز کنید.' });
        setLoading(false);
      });
  };

  useEffect(() => { getRequests(); }, []);

  const handleCancelRequest = async (requestId: string) => {
    try {
      setLoadingRequest(true);
      await axiosService({ url: `${API.CANCEL_REQUEST}/${requestId}`, method: 'put', token: Cookies.get('auth_token') });
      toast({ title: 'موفق', description: 'درخواست لغو شد.' });
      getRequests();
      setShowConfirmCancel(false);
      setRequestToCancel(null);
      setLoadingRequest(false);
    } catch {
      toast({ variant: 'destructive', title: 'خطا', description: 'لغو درخواست انجام نشد.' });
      setLoadingRequest(false);
    }
  };

  const handleEditRequest = (request: HistoryItem) => {
    setSelectedRequest(request);
    setEditFormData({
      address: request.location.address,
      location: { lat: request.location.lat, lng: request.location.lng },
      date: request.timeSlot.date,
      time: request.timeSlot.time,
      wasteType: request.wasteType,
    });
    setIsEditModalOpen(true);
  };

  const handleLocationSelect = async (latlng: { lat: number; lng: number }) => {
    setEditFormData((prev) => ({ ...prev, location: latlng }));
    setLocationLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json&accept-language=fa`,
      );
      const data = await response.json();
      setEditFormData((prev) => ({ ...prev, address: data.display_name || 'آدرس یافت نشد' }));
    } catch {
      setEditFormData((prev) => ({ ...prev, address: 'خطا در دریافت آدرس' }));
    } finally {
      setLocationLoading(false);
    }
  };

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditFormData((prev) => ({ ...prev, address: value }));
    if (value.length > 2) {
      setLocationLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&limit=5&countrycodes=ir&accept-language=fa`,
        );
        setSuggestions(await response.json());
      } catch {
        setSuggestions([]);
      } finally {
        setLocationLoading(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (s: { display_name: string; lat: string; lon: string }) => {
    setEditFormData((prev) => ({
      ...prev,
      location: { lat: parseFloat(s.lat), lng: parseFloat(s.lon) },
      address: s.display_name,
    }));
    setSuggestions([]);
  };

  const handleSaveEdit = async () => {
    if (!selectedRequest || !editFormData.location || !editFormData.address) return;
    try {
      setLoadingRequest(true);
      await axiosService({
        url: `${API.UPDATE_REQUEST}/${selectedRequest._id}`,
        method: 'put',
        token: Cookies.get('auth_token'),
        body: {
          location: { address: editFormData.address, lat: editFormData.location.lat, lng: editFormData.location.lng },
          timeSlot: { date: editFormData.date, time: editFormData.time },
          wasteType: editFormData.wasteType,
        },
      });
      toast({ title: 'موفق', description: 'درخواست ویرایش شد.' });
      getRequests();
      setIsEditModalOpen(false);
      setSelectedRequest(null);
      setLoadingRequest(false);
    } catch {
      toast({ variant: 'destructive', title: 'خطا', description: 'ویرایش درخواست انجام نشد.' });
      setLoadingRequest(false);
    }
  };

  const filtered = [...requestsItems]
    .filter((item) => selectedStatus === 'all' || item.status === selectedStatus)
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'date') return order * (new Date(a.date).getTime() - new Date(b.date).getTime());
      return order * (a.totalPrice - b.totalPrice);
    });

  const stats = requestsItems.reduce(
    (acc, curr) => {
      if (curr.status === 'completed') {
        acc.totalEarnings += curr.totalPrice;
        acc.totalWeight += curr.items.reduce((sum, item) => sum + item.quantity, 0);
      }
      acc.totalOrders += 1;
      return acc;
    },
    { totalEarnings: 0, totalWeight: 0, totalOrders: 0 },
  );

  const openCount = requestsItems.filter((r) => r.status === 'pending' || r.status === 'collecting').length;

  // Header and tab bar are rendered once by app/(user)/layout.tsx; the modals
  // below are siblings of the screen so they overlay the tab bar too.
  return (
    <>
      <Screen>
        <Hero
          icon={<FileClock className="h-6 w-6" />}
          title="پیگیری درخواست‌ها"
          sub={
            openCount > 0
              ? `${fa(openCount)} درخواست در جریان دارید. هر کارت مسیر کامل آن درخواست را نشان می‌دهد.`
              : 'هر کارت، مسیر کامل یک درخواست را از ثبت تا تسویه نشان می‌دهد.'
          }
          aside={
            <button
              type="button"
              onClick={getRequests}
              aria-label="به‌روزرسانی"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.3)',
                color: C.onHero, padding: '10px 16px', borderRadius: S.rPill,
                fontSize: S.xs, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <RotateCw className="h-3.5 w-3.5" />
              به‌روزرسانی
            </button>
          }
        />

        {/* ── totals ── */}
        <div style={{ display: 'grid', gap: S.s3, gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
          <Stat label="درآمد کل" value={fa(stats.totalEarnings)} unit="تومان" icon={<BanknoteIcon className="h-4 w-4" />} color={C.green} />
          <Stat label="وزن بازیافت‌شده" value={fa(stats.totalWeight)} unit="کیلوگرم" icon={<ScaleIcon className="h-4 w-4" />} color={C.statusInfo} />
          <Stat label="تعداد درخواست" value={fa(stats.totalOrders)} icon={<Package2Icon className="h-4 w-4" />} color={C.violet} />
        </div>

        {/* ── filters ── */}
        <div className="pm-scroll-x" style={{ display: 'flex', gap: S.s2, margin: `${S.s5}px 0 ${S.s3}px`, paddingBottom: 4 }}>
          <FilterChip label="همه" count={requestsItems.length} active={selectedStatus === 'all'} color={C.statusNeutral} onClick={() => setSelectedStatus('all')} />
          {(Object.keys(STATUS_THEME) as RequestStatus[]).map((s) => (
            <FilterChip
              key={s}
              label={STATUS_THEME[s].label}
              count={requestsItems.filter((r) => r.status === s).length}
              active={selectedStatus === s}
              color={STATUS_THEME[s].color}
              onClick={() => setSelectedStatus(s)}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: S.s2, marginBottom: S.s3 }}>
          <SortBtn
            label="تاریخ"
            on={sortBy === 'date'}
            asc={sortOrder === 'asc'}
            onClick={() => (sortBy === 'date' ? setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') : (setSortBy('date'), setSortOrder('desc')))}
          />
          <SortBtn
            label="مبلغ"
            on={sortBy === 'totalPrice'}
            asc={sortOrder === 'asc'}
            onClick={() => (sortBy === 'totalPrice' ? setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') : (setSortBy('totalPrice'), setSortOrder('desc')))}
          />
        </div>

        {/* ── list ── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.s3 }}>
            {[0, 1, 2].map((i) => (
              <Card key={i}>
                <div style={{ padding: S.s4, height: 168, position: 'relative', overflow: 'hidden' }}>
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute', inset: 0, width: '40%',
                      background: `linear-gradient(90deg, transparent, ${C.bgSubtle}, transparent)`,
                      animation: 'pmSweep 1.4s ease-in-out infinite',
                    }}
                  />
                </div>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<PackagePlus className="h-6 w-6" />}
            title={selectedStatus === 'all' ? 'هنوز درخواستی ثبت نکرده‌اید' : 'در این وضعیت درخواستی نیست'}
            sub={selectedStatus === 'all' ? 'اولین درخواست جمع‌آوری را ثبت کنید تا مسیرش را همین‌جا ببینید.' : undefined}
            action={
              <Link
                href="/new-request"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: S.s2, marginTop: S.s2,
                  padding: '12px 20px', borderRadius: S.r2, textDecoration: 'none',
                  background: C.green, color: C.onAccent, fontSize: S.sm, fontWeight: 800,
                }}
              >
                <PackagePlus className="h-4 w-4" />
                ثبت درخواست
              </Link>
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.s3 }}>
            {filtered.map((item, i) => {
              const meta = wasteMeta(item.wasteType);
              const theme = STATUS_THEME[item.status];
              const isOpen = expanded === item._id;
              const canceled = item.status === 'canceled';

              return (
                <div key={item._id} className="pm-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}>
                  <Card accent={theme.color}>
                    <div style={{ padding: S.s4 }}>
                      {/* header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: S.s3 }}>
                        <IconBadge color={meta.color}><meta.Icon className="h-5 w-5" /></IconBadge>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: S.base, fontWeight: 800, color: C.textStrong }}>{meta.name}</p>
                          <p className="tnum" style={{ margin: '5px 0 0', fontSize: S.xs, color: C.muted, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <CalendarClock className="h-3 w-3" />
                              {item.timeSlot?.date} • {item.timeSlot?.time}
                            </span>
                            <span style={{ color: C.subtle }}>#{item._id.slice(-6)}</span>
                          </p>
                        </div>
                        <span
                          style={{
                            flexShrink: 0, fontSize: S.xs, fontWeight: 800, whiteSpace: 'nowrap',
                            padding: '6px 12px', borderRadius: S.rPill,
                            background: alpha(theme.color, 12), color: theme.color,
                            border: `1px solid ${alpha(theme.color, 26)}`,
                          }}
                        >
                          {theme.label}
                        </span>
                      </div>

                      {/* the rail */}
                      <div style={{ marginTop: S.s4, paddingTop: S.s4, borderTop: `1px dashed ${C.border}` }}>
                        <StepRail
                          steps={STAGES.map((s, idx) => ({
                            ...s,
                            detail:
                              canceled && idx === 1
                                ? 'این درخواست پیش از تأیید لغو شد.'
                                : idx === 2 && item.collector
                                  ? `جمع‌آور: ${item.collector}`
                                  : idx === 3 && item.status === 'completed'
                                    ? `${fa(item.totalPrice)} تومان به کیف پول شما واریز شد.`
                                    : undefined,
                          }))}
                          current={stageOf(item.status)}
                          failed={canceled}
                          color={canceled ? C.statusDanger : C.green}
                          compact
                        />
                      </div>

                      {/* address + money */}
                      <div
                        style={{
                          marginTop: S.s3, paddingTop: S.s3, borderTop: `1px dashed ${C.border}`,
                          display: 'flex', alignItems: 'center', gap: S.s3, flexWrap: 'wrap',
                        }}
                      >
                        <p style={{ margin: 0, flex: '1 1 200px', minWidth: 0, fontSize: S.xs, color: C.muted, lineHeight: 1.8, display: 'flex', gap: 6 }}>
                          <MapPin className="h-3.5 w-3.5" style={{ flexShrink: 0, marginTop: 2 }} />
                          <span style={{ overflowWrap: 'anywhere' }}>{item.location?.address}</span>
                        </p>
                        {item.totalPrice > 0 && item.status !== 'pending' && (
                          <span className="tnum" style={{ fontSize: S.base, fontWeight: 800, color: C.green, whiteSpace: 'nowrap' }}>
                            {fa(item.totalPrice)} تومان
                          </span>
                        )}
                      </div>

                      {/* items, folded away until asked for */}
                      {item.items?.length > 0 && (
                        <div style={{ marginTop: S.s3 }}>
                          <button
                            type="button"
                            onClick={() => setExpanded(isOpen ? null : item._id)}
                            style={{
                              background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                              fontFamily: 'inherit', fontSize: S.xs, fontWeight: 800, color: C.green,
                            }}
                          >
                            {isOpen ? 'بستن اقلام' : `مشاهدهٔ اقلام (${fa(item.items.length)})`}
                          </button>

                          {isOpen && (
                            <div className="pm-fade-up" style={{ marginTop: S.s3, display: 'flex', flexDirection: 'column', gap: 7 }}>
                              {item.items.map((it) => (
                                <div
                                  key={it._id}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: S.s2,
                                    background: C.surface2, borderRadius: S.r1, padding: `${S.s2}px ${S.s3}px`,
                                  }}
                                >
                                  <span style={{ flex: 1, minWidth: 0, fontSize: S.xs, fontWeight: 700, color: C.text }}>{it.title}</span>
                                  <span className="tnum" style={{ fontSize: S.xs, color: C.muted }}>
                                    {fa(it.quantity)} {it.unit}
                                  </span>
                                  <span className="tnum" style={{ fontSize: S.xs, fontWeight: 800, color: C.textStrong }}>
                                    {fa(it.quantity * it.pricePerUnit)} ت
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* only a request that has not been approved can still be changed */}
                      {item.status === 'pending' && (
                        <div style={{ display: 'flex', gap: S.s2, marginTop: S.s4 }}>
                          <Btn variant="soft" color={C.statusInfo} onClick={() => handleEditRequest(item)} style={{ padding: '10px 16px', fontSize: S.sm }}>
                            <Pencil className="h-3.5 w-3.5" />
                            ویرایش
                          </Btn>
                          <Btn
                            variant="soft"
                            color={C.statusDanger}
                            onClick={() => { setRequestToCancel(item._id); setShowConfirmCancel(true); }}
                            style={{ padding: '10px 16px', fontSize: S.sm }}
                          >
                            <X className="h-3.5 w-3.5" />
                            لغو
                          </Btn>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </Screen>

      {/* ── cancel confirmation ── */}
      {showConfirmCancel && (
        <Modal onClose={() => { setShowConfirmCancel(false); setRequestToCancel(null); }}>
          <div style={{ padding: S.s5 }}>
            <p style={{ margin: 0, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>لغو درخواست</p>
            <p style={{ margin: `${S.s3}px 0 ${S.s5}px`, fontSize: S.sm, color: C.muted, lineHeight: 1.9 }}>
              این درخواست لغو می‌شود و قابل بازگرداندن نیست. برای همان پسماند می‌توانید درخواست تازه‌ای ثبت کنید.
            </p>
            <div style={{ display: 'flex', gap: S.s2, justifyContent: 'flex-start' }}>
              <Btn
                color={C.statusDanger}
                disabled={loadingRequest}
                onClick={() => requestToCancel && handleCancelRequest(requestToCancel)}
              >
                {loadingRequest ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                تأیید لغو
              </Btn>
              <Btn variant="ghost" onClick={() => { setShowConfirmCancel(false); setRequestToCancel(null); }}>
                انصراف
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* ── edit ── */}
      {isEditModalOpen && selectedRequest && (
        <Modal wide onClose={() => { setIsEditModalOpen(false); setSelectedRequest(null); }}>
          <div style={{ padding: S.s5, display: 'flex', flexDirection: 'column', gap: S.s5 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: S.s3 }}>
              <p style={{ margin: 0, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>ویرایش درخواست</p>
              <button
                type="button"
                onClick={() => { setIsEditModalOpen(false); setSelectedRequest(null); }}
                aria-label="بستن"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.muted, padding: 4 }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div style={{ height: 260, borderRadius: S.r2, overflow: 'hidden', border: `1px solid ${C.border}` }}>
              <MapWithNoSSR
                center={editFormData.location || { lat: 35.6892, lng: 51.389 }}
                onLocationSelect={handleLocationSelect}
                selectedLocation={editFormData.location}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: S.sm, fontWeight: 700, color: C.text, marginBottom: S.s2 }}>آدرس دقیق</label>
              <input
                type="text"
                value={editFormData.address}
                onChange={handleAddressChange}
                placeholder="جستجوی آدرس…"
                className="pm-field"
                style={{ fontWeight: 600 }}
              />
              {locationLoading && (
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

            <div>
              <p style={{ margin: `0 0 ${S.s2}px`, fontSize: S.sm, fontWeight: 700, color: C.text }}>نوع پسماند</p>
              <div style={{ display: 'grid', gap: S.s2, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                {WASTE_TYPES.map((w) => {
                  const on = editFormData.wasteType === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setEditFormData((prev) => ({ ...prev, wasteType: w.id }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: S.s2, textAlign: 'start', cursor: 'pointer',
                        padding: `${S.s2}px ${S.s3}px`, borderRadius: S.r2, fontFamily: 'inherit',
                        background: on ? alpha(w.color, 12) : C.surface2,
                        border: `1.5px solid ${on ? w.color : C.border}`,
                        color: on ? w.color : C.text,
                      }}
                    >
                      <w.Icon className="h-4 w-4" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: S.xs, fontWeight: 800 }}>{w.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p style={{ margin: `0 0 ${S.s2}px`, fontSize: S.sm, fontWeight: 700, color: C.text }}>بازهٔ زمانی</p>
              <div style={{ display: 'grid', gap: S.s2, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                {TIME_SLOTS.map((slot) => {
                  const on = editFormData.time === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setEditFormData((prev) => ({ ...prev, time: slot }))}
                      className="tnum"
                      style={{
                        padding: `${S.s3}px`, borderRadius: S.r2, cursor: 'pointer', fontFamily: 'inherit',
                        fontSize: S.sm, fontWeight: 800, direction: 'ltr',
                        background: on ? alpha(C.green, 12) : C.surface2,
                        border: `1.5px solid ${on ? C.green : C.border}`,
                        color: on ? C.green : C.text,
                      }}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: S.s2 }}>
              <Btn full disabled={!editFormData.address || !editFormData.location || loadingRequest} onClick={handleSaveEdit}>
                {loadingRequest ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                ذخیرهٔ تغییرات
              </Btn>
              <Btn variant="ghost" onClick={() => { setIsEditModalOpen(false); setSelectedRequest(null); }}>
                انصراف
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ── small pieces ────────────────────────────────────────────────────────── */

function FilterChip({ label, count, active, color, onClick }: { label: string; count: number; active: boolean; color: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0,
        padding: '9px 14px', borderRadius: S.rPill, cursor: 'pointer', fontFamily: 'inherit',
        fontSize: S.xs, fontWeight: 800,
        background: active ? color : C.surface,
        color: active ? C.onAccent : C.muted,
        border: `1px solid ${active ? color : C.border}`,
        transition: 'background .18s ease, color .18s ease',
      }}
    >
      {label}
      <span
        className="tnum"
        style={{
          fontSize: 10, padding: '1px 6px', borderRadius: 999,
          background: active ? 'rgba(255,255,255,0.22)' : C.bgSubtle,
          color: active ? C.onAccent : C.subtle,
        }}
      >
        {fa(count)}
      </span>
    </button>
  );
}

function SortBtn({ label, on, asc, onClick }: { label: string; on: boolean; asc: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '9px 14px', borderRadius: S.r1, cursor: 'pointer', fontFamily: 'inherit',
        fontSize: S.xs, fontWeight: 700,
        background: C.surface, border: `1px solid ${on ? alpha(C.green, 35) : C.border}`,
        color: on ? C.green : C.muted,
      }}
    >
      {label}
      {on && (asc ? <ArrowUpIcon size={13} /> : <ArrowDownIcon size={13} />)}
    </button>
  );
}

