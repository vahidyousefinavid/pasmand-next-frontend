'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { User, Phone, Mail, Edit2, Package2, MapPin, LogOut, ChevronLeft, Loader2, Check } from 'lucide-react';

import { axiosService } from '@/lib/axiosService';
import { API } from '@/services/const';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { C, S, alpha, fa } from '@/components/ui/tokens';
import { Screen, Hero, Card, IconBadge, Btn, Field, Shimmer } from '@/components/ui/kit';

interface UserProfile {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  description: string;
  has_password: boolean;
  accessible: boolean;
  personalPicture: string;
  addresses: any[];
  pasmandRequests: any[];
}

const EMPTY: UserProfile = {
  first_name: '', last_name: '', phone: '', email: '', description: '',
  has_password: false, accessible: false, personalPicture: '', addresses: [], pasmandRequests: [],
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(EMPTY);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(EMPTY);

  const { logout } = useAuth();
  const { toast } = useToast();

  const getProfile = () => {
    setLoading(true);
    axiosService({ url: API.GET_PROFILE, method: 'get', token: Cookies.get('auth_token') })
      .then((res: any) => {
        setProfile(res?.data?.user || EMPTY);
        setLoading(false);
      })
      .catch(() => {
        toast({ variant: 'destructive', title: 'ناموفق', description: 'دریافت پروفایل انجام نشد.' });
        setLoading(false);
      });
  };

  const updateProfile = () => {
    setSaving(true);
    axiosService({ url: API.UPDATE_PROFILE, method: 'put', body: editedProfile, token: Cookies.get('auth_token') })
      .then((res: any) => {
        setProfile(res?.data?.user || editedProfile);
        setIsEditing(false);
        setSaving(false);
        toast({ variant: 'success', title: 'ذخیره شد', description: 'اطلاعات شما به‌روز شد.' });
      })
      .catch(() => {
        toast({ variant: 'destructive', title: 'ناموفق', description: 'ذخیرهٔ تغییرات انجام نشد.' });
        setSaving(false);
      });
  };

  useEffect(() => { getProfile(); }, []);

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  const initials = (profile.first_name?.[0] || '') + (profile.last_name?.[0] || '');

  return (
    <Screen>
      {/* No `icon` here: the avatar in `aside` is already the picture of the
          account, and two person glyphs in one header read as a bug. */}
      <Hero
        title={fullName || 'حساب کاربری'}
        sub={profile.phone ? `شمارهٔ همراه: ${profile.phone}` : 'اطلاعات شما برای هماهنگی جمع‌آوری استفاده می‌شود.'}
        aside={
          <span
            style={{
              width: 58, height: 58, borderRadius: 20, flexShrink: 0, display: 'grid', placeItems: 'center',
              background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.26)',
              fontSize: S.lg, fontWeight: 800, color: C.onHero, overflow: 'hidden',
            }}
          >
            {profile.personalPicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.personalPicture} alt={`تصویر پروفایل ${fullName || 'کاربر'}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : initials ? (
              initials
            ) : (
              <User className="h-6 w-6" />
            )}
          </span>
        }
      />

      {/* ── details ── */}
      <Card>
        <div style={{ padding: `${S.s4}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: S.s3, marginBottom: S.s4 }}>
            <p style={{ margin: 0, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>اطلاعات شخصی</p>
            {!isEditing && (
              <button
                type="button"
                onClick={() => { setEditedProfile(profile); setIsEditing(true); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: 'inherit',
                  padding: '7px 14px', borderRadius: S.rPill, fontSize: S.xs, fontWeight: 800,
                  background: alpha(C.green, 10), color: C.green, border: `1px solid ${alpha(C.green, 22)}`,
                }}
              >
                <Edit2 className="h-3.5 w-3.5" />
                ویرایش
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
              {[0, 1, 2].map((i) => <Shimmer key={i} height={52} radius={14} />)}
            </div>
          ) : isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: S.s3 }}>
              <Field label="نام">
                <input
                  className="pm-field"
                  value={editedProfile.first_name || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, first_name: e.target.value })}
                />
              </Field>
              <Field label="نام خانوادگی">
                <input
                  className="pm-field"
                  value={editedProfile.last_name || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, last_name: e.target.value })}
                />
              </Field>
              <Field label="شمارهٔ همراه" hint="شمارهٔ ورود به سامانه است و تغییر نمی‌کند.">
                <input className="pm-field tnum" dir="ltr" value={editedProfile.phone || ''} disabled />
              </Field>
              <Field label="ایمیل">
                <input
                  className="pm-field"
                  dir="ltr"
                  type="email"
                  value={editedProfile.email || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                />
              </Field>

              <div style={{ display: 'flex', gap: S.s2, marginTop: S.s2 }}>
                <Btn full onClick={updateProfile} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  ذخیرهٔ تغییرات
                </Btn>
                <Btn variant="ghost" onClick={() => setIsEditing(false)}>انصراف</Btn>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: S.s3 }}>
              <Row icon={<User className="h-4 w-4" />} label="نام و نام خانوادگی" value={fullName} />
              <Row icon={<Phone className="h-4 w-4" />} label="شمارهٔ همراه" value={profile.phone} ltr />
              <Row icon={<Mail className="h-4 w-4" />} label="ایمیل" value={profile.email} ltr />
            </div>
          )}
        </div>
      </Card>

      {/* ── what the account has ── */}
      <div style={{ display: 'grid', gap: S.s3, gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', marginTop: S.s3 }}>
        <LinkCard
          href="/history"
          icon={<Package2 className="h-4 w-4" />}
          color={C.statusInfo}
          title="درخواست‌های من"
          sub={`${fa(profile.pasmandRequests?.length || 0)} درخواست`}
        />
        <LinkCard
          href="/addresses"
          icon={<MapPin className="h-4 w-4" />}
          color={C.amber}
          title="آدرس‌های من"
          sub={`${fa(profile.addresses?.length || 0)} آدرس ذخیره‌شده`}
        />
      </div>

      <div style={{ marginTop: S.s5 }}>
        <Btn variant="soft" color={C.statusDanger} full onClick={() => logout()}>
          <LogOut className="h-4 w-4" />
          خروج از حساب
        </Btn>
      </div>
    </Screen>
  );
}

function Row({ icon, label, value, ltr }: { icon: React.ReactNode; label: string; value?: string; ltr?: boolean }) {
  const empty = !value;
  // `dir="ltr"` is for phone numbers and email addresses. Applying it to the
  // "ثبت نشده" placeholder flips that Persian text to the wrong edge, so the
  // direction follows the content, not the field.
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: S.s3 }}>
      <IconBadge color={C.statusNeutral} size={36}>{icon}</IconBadge>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ margin: 0, fontSize: S.xs, color: C.muted, fontWeight: 600 }}>{label}</p>
        <p
          className={ltr && !empty ? 'tnum' : undefined}
          dir={ltr && !empty ? 'ltr' : undefined}
          style={{
            margin: '3px 0 0', fontSize: S.sm, fontWeight: 700,
            color: empty ? C.subtle : C.textStrong,
            textAlign: 'start', overflowWrap: 'anywhere',
          }}
        >
          {value || 'ثبت نشده'}
        </p>
      </div>
    </div>
  );
}

function LinkCard({ href, icon, color, title, sub }: { href: string; icon: React.ReactNode; color: string; title: string; sub: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Card interactive>
        <div style={{ padding: `${S.s4}px`, display: 'flex', alignItems: 'center', gap: S.s3 }}>
          <IconBadge color={color} size={40}>{icon}</IconBadge>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>{title}</p>
            <p style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted }}>{sub}</p>
          </div>
          <ChevronLeft className="h-4 w-4" style={{ color: C.subtle, flexShrink: 0 }} />
        </div>
      </Card>
    </Link>
  );
}
