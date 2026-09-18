'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import {
  Building2,
  ChevronLeft,
  Clock,
  FileText,
  Map as MapIcon,
  BadgePercent,
  AlertCircle,
  Wallet,
} from 'lucide-react';

import { axiosService } from '@/lib/axiosService';
import { C, S, alpha, fa } from '@/components/ui/tokens';
import {
  Screen, Hero, Card, IconBadge, SectionTitle, Shimmer, EmptyState, Btn, Modal, StepRail,
} from '@/components/ui/kit';
import { TopMenu } from '@/components/views/top-menu';
import { Navigation } from '@/components/views/navigation';
import {
  DynamicForm, FormDefinition, FormFiles, FormValues, findMissing, toFormData, displayValue,
} from './dynamic-form';

/**
 * ساخت‌وساز و املاک — the citizen's screen.
 *
 * Two halves: the services this city offers, and the files this citizen has
 * open. The files come first when any of them is waiting on the citizen,
 * because «پروندهٔ شما منتظر شماست» is the only thing on this page that is
 * urgent — everything else can be read at leisure.
 *
 * Nothing here knows what a پروانهٔ ساخت asks for. The form arrives with the
 * service and is drawn by `DynamicForm`; this file only decides when to show
 * it and what to do with the answer.
 */

const ICONS: Record<string, any> = { Building2, Map: MapIcon, BadgePercent, FileText };
const iconOf = (name: string) => ICONS[name] || FileText;

const TONE: Record<string, string> = {
  wait: C.statusNeutral,
  work: C.statusInfo,
  done: C.statusOk,
  stop: C.statusWarn,
};

interface Service {
  _id: string;
  key: string;
  title: string;
  short: string;
  description: string;
  icon: string;
  color: string;
  form: FormDefinition;
  stages: { key: string; title: string; kind: string; note?: string }[];
}

interface RequestCard {
  _id: string;
  code: string;
  display: string;
  serviceKey: string;
  serviceTitle: string;
  status: string;
  statusTitle: string;
  tone: string;
  stage: string;
  waitingOnYou: boolean;
  fee: { amount: number; paidAt?: string } | null;
  createdAt: string;
  updatedAt: string;
}

const token = () => Cookies.get('auth_token');

export default function UrbanPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<RequestCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState('');
  const [picked, setPicked] = useState<Service | null>(null);
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const load = useCallback(() => {
    const auth = token();
    if (!auth) return;
    setLoading(true);
    Promise.all([
      axiosService({ url: '/api/v1/urban/services', method: 'get', token: auth }),
      axiosService({ url: '/api/v1/urban/requests', method: 'get', token: auth }),
    ])
      .then(([a, b]: any) => {
        setServices(a?.data?.services || []);
        setRequests(b?.data?.requests || []);
        setBlocked('');
      })
      .catch((e: any) => setBlocked(e?.data?.message || 'خدمات ساخت‌وساز در دسترس نیست.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    // Opened from a notification: «/urban?open=<id>».
    const id = new URLSearchParams(window.location.search).get('open');
    if (id) setOpenFile(id);
  }, [load]);

  const waiting = useMemo(() => requests.filter((r) => r.waitingOnYou), [requests]);

  if (blocked) {
    return (
      <>
        <TopMenu />
        <Screen>
          <EmptyState
            icon={<Building2 className="h-6 w-6" />}
            title="در دسترس نیست"
            sub={blocked}
          />
        </Screen>
        <Navigation />
      </>
    );
  }

  return (
    <>
      <TopMenu />
      <Screen>
        <Hero
          icon={<Building2 className="h-6 w-6" />}
          title="ساخت‌وساز و املاک"
          sub="درخواست‌های ساختمانی و ملکی را ثبت کنید و مرحله‌به‌مرحله دنبال کنید."
          aside={
            requests.length ? (
              <span className="tnum" style={{ fontSize: S.sm, fontWeight: 800, color: C.onHero }}>
                {fa(requests.length)} پرونده
              </span>
            ) : undefined
          }
        />

        {toast && (
          <div
            style={{
              margin: `${S.s3}px 0`, padding: `${S.s3}px ${S.s4}px`, borderRadius: S.r3,
              background: alpha(C.green, 10), border: `1px solid ${alpha(C.green, 28)}`,
              color: C.green, fontSize: S.xs, fontWeight: 700,
            }}
          >
            {toast}
          </div>
        )}

        {/* Anything the municipality has handed back comes first — it is the
            only thing on this page that will not move without the citizen. */}
        {waiting.length > 0 && (
          <>
            <SectionTitle title="منتظر شماست" />
            <div style={{ display: 'grid', gap: S.s3 }}>
              {waiting.map((row) => (
                <RequestRow key={row._id} row={row} onOpen={() => setOpenFile(row._id)} highlight />
              ))}
            </div>
          </>
        )}

        <SectionTitle title="خدمات" />
        {loading ? (
          <div style={{ display: 'grid', gap: S.s3 }}>
            {[0, 1, 2].map((i) => <Shimmer key={i} height={104} />)}
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-6 w-6" />}
            title="هنوز خدمتی تعریف نشده"
            sub="شهرداری شهر شما هنوز خدمات ساخت‌وساز را روی سامانه منتشر نکرده است."
          />
        ) : (
          <div style={{ display: 'grid', gap: S.s3 }}>
            {services.map((service) => {
              const Icon = iconOf(service.icon);
              return (
                <Card key={service._id} interactive onClick={() => setPicked(service)}>
                  <div style={{ padding: S.s4, display: 'flex', gap: S.s3, alignItems: 'flex-start' }}>
                    <IconBadge color={service.color}><Icon className="h-5 w-5" /></IconBadge>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>
                        {service.title}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted, lineHeight: 1.8 }}>
                        {service.short}
                      </p>
                      {service.stages?.length > 0 && (
                        <p style={{ margin: '7px 0 0', fontSize: 11, color: C.subtle }}>
                          {fa(service.stages.length)} مرحله تا صدور
                        </p>
                      )}
                    </div>
                    <ChevronLeft className="h-4 w-4" style={{ color: C.subtle, flexShrink: 0 }} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {requests.length > 0 && (
          <>
            <SectionTitle title="پرونده‌های من" />
            <div style={{ display: 'grid', gap: S.s3 }}>
              {requests
                .filter((r) => !r.waitingOnYou)
                .map((row) => (
                  <RequestRow key={row._id} row={row} onOpen={() => setOpenFile(row._id)} />
                ))}
            </div>
          </>
        )}
      </Screen>

      {picked && (
        <SubmitSheet
          service={picked}
          onClose={() => setPicked(null)}
          onDone={(message) => {
            setPicked(null);
            setToast(message);
            load();
          }}
        />
      )}

      {openFile && (
        <FileSheet
          id={openFile}
          onClose={() => setOpenFile(null)}
          onChanged={(message) => {
            setToast(message);
            load();
          }}
        />
      )}

      <Navigation />
    </>
  );
}

/* ── one file in the list ────────────────────────────────────────────────── */

function RequestRow({ row, onOpen, highlight }: { row: RequestCard; onOpen: () => void; highlight?: boolean }) {
  const tone = TONE[row.tone] || C.statusNeutral;
  return (
    <Card interactive onClick={onOpen} accent={highlight ? tone : undefined}>
      <div style={{ padding: S.s4, display: 'flex', gap: S.s3, alignItems: 'center' }}>
        <IconBadge color={tone}><FileText className="h-4 w-4" /></IconBadge>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>
            {row.serviceTitle}
          </p>
          <p className="tnum" style={{ margin: '4px 0 0', fontSize: 11, color: C.subtle }} dir="ltr">
            <bdi>{row.display}</bdi>
          </p>
        </div>
        <span
          style={{
            flexShrink: 0, padding: '5px 11px', borderRadius: 999,
            background: alpha(tone, 12), color: tone, fontSize: 11, fontWeight: 800,
          }}
        >
          {row.statusTitle}
        </span>
      </div>
    </Card>
  );
}

/* ── submitting ──────────────────────────────────────────────────────────── */

function SubmitSheet({
  service,
  onClose,
  onDone,
}: {
  service: Service;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [values, setValues] = useState<FormValues>({});
  const [files, setFiles] = useState<FormFiles>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = () => {
    const missing = findMissing(service.form, values, files);
    if (missing) return setError(missing);

    setBusy(true);
    setError('');
    axiosService({
      url: '/api/v1/urban/requests',
      method: 'post',
      isFormData: true,
      token: token(),
      body: toFormData(values, files, { serviceKey: service.key }),
      timeout: 120000,
    })
      .then((res: any) => onDone(res?.data?.message || 'پرونده ثبت شد.'))
      .catch((e: any) => setError(e?.data?.message || 'ثبت پرونده انجام نشد.'))
      .finally(() => setBusy(false));
  };

  return (
    <Modal onClose={onClose} wide>
      <div style={{ padding: S.s5, display: 'grid', gap: S.s5 }}>
        <div>
          <p style={{ margin: 0, fontSize: S.lg, fontWeight: 800, color: C.textStrong }}>{service.title}</p>
          {service.description && (
            <p style={{ margin: '6px 0 0', fontSize: S.xs, color: C.muted, lineHeight: 1.9 }}>
              {service.description}
            </p>
          )}
        </div>

        {/* The road ahead, before starting rather than one status at a time. */}
        {service.stages?.length > 0 && (
          <StepRail
            steps={service.stages.map((s) => ({ key: s.key, title: s.title, detail: s.note }))}
            current={0}
            compact
          />
        )}

        <DynamicForm
          form={service.form}
          values={values}
          files={files}
          onChange={(key, value) => setValues((v) => ({ ...v, [key]: value }))}
          onFiles={(key, list) => setFiles((f) => ({ ...f, [key]: list }))}
        />

        {error && (
          <p style={{
            margin: 0, padding: `${S.s3}px ${S.s4}px`, borderRadius: S.r3,
            background: alpha(C.statusDanger, 8), border: `1px solid ${alpha(C.statusDanger, 22)}`,
            color: C.statusDanger, fontSize: S.xs, lineHeight: 1.8,
          }}>
            {error}
          </p>
        )}

        <Btn onClick={submit} disabled={busy} full>
          {busy ? 'در حال ثبت…' : 'ثبت پرونده'}
        </Btn>
      </div>
    </Modal>
  );
}

/* ── one file, in full ───────────────────────────────────────────────────── */

function FileSheet({
  id,
  onClose,
  onChanged,
}: {
  id: string;
  onClose: () => void;
  onChanged: (message: string) => void;
}) {
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fixing, setFixing] = useState(false);
  const [values, setValues] = useState<FormValues>({});
  const [files, setFiles] = useState<FormFiles>({});

  const load = useCallback(() => {
    setLoading(true);
    axiosService({ url: `/api/v1/urban/requests/${id}`, method: 'get', token: token() })
      .then((res: any) => {
        setFile(res?.data?.request || null);
        setValues(res?.data?.request?.values || {});
      })
      .catch((e: any) => setError(e?.data?.message || 'پرونده باز نشد.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(load, [load]);

  const act = (path: string, body?: any, isForm = false) => {
    setBusy(true);
    setError('');
    axiosService({
      url: `/api/v1/urban/requests/${id}/${path}`,
      method: 'post',
      token: token(),
      isFormData: isForm,
      body,
      timeout: 120000,
    })
      .then((res: any) => {
        onChanged(res?.data?.message || 'انجام شد.');
        setFixing(false);
        load();
      })
      .catch((e: any) => setError(e?.data?.message || 'انجام نشد.'))
      .finally(() => setBusy(false));
  };

  const fields = useMemo(
    () => (file?.form?.sections || []).flatMap((s: any) => s.fields || []).filter((f: any) => f.type !== 'note'),
    [file],
  );

  return (
    <Modal onClose={onClose} wide>
      <div style={{ padding: S.s5, display: 'grid', gap: S.s5 }}>
        {loading ? (
          <>
            <Shimmer height={30} />
            <Shimmer height={120} />
          </>
        ) : !file ? (
          <EmptyState icon={<AlertCircle className="h-6 w-6" />} title="پرونده پیدا نشد" sub={error} />
        ) : (
          <>
            <div>
              <p style={{ margin: 0, fontSize: S.lg, fontWeight: 800, color: C.textStrong }}>
                {file.serviceTitle}
              </p>
              <p className="tnum" style={{ margin: '5px 0 0', fontSize: S.xs, color: C.subtle }} dir="ltr">
                <bdi>{file.display}</bdi>
              </p>
              <span
                style={{
                  display: 'inline-block', marginTop: S.s2, padding: '5px 12px', borderRadius: 999,
                  background: alpha(TONE[file.tone] || C.statusNeutral, 12),
                  color: TONE[file.tone] || C.statusNeutral, fontSize: 11, fontWeight: 800,
                }}
              >
                {file.statusTitle}{file.stageTitle ? ` · ${file.stageTitle}` : ''}
              </span>
            </div>

            {file.stages?.length > 0 && (
              <StepRail
                steps={file.stages.map((s: any) => ({ key: s.key, title: s.title, detail: s.note }))}
                current={Math.max(0, file.stages.findIndex((s: any) => s.state === 'current'))}
                failed={file.status === 'rejected'}
                compact
              />
            )}

            {/* Money owed is an instruction, so it is a panel and not a line. */}
            {file.fee && !file.fee.paidAt && file.status === 'awaiting_payment' && (
              <Card accent={C.statusWarn}>
                <div style={{ padding: S.s4, display: 'grid', gap: S.s3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: S.s2 }}>
                    <Wallet className="h-4 w-4" style={{ color: C.statusWarn }} />
                    <span className="tnum" style={{ fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>
                      {fa(file.fee.amount)} تومان
                    </span>
                  </div>
                  {file.fee.description && (
                    <p style={{ margin: 0, fontSize: S.xs, color: C.muted, lineHeight: 1.8 }}>
                      {file.fee.description}
                    </p>
                  )}
                  <Btn onClick={() => act('pay')} disabled={busy} full>
                    {busy ? 'در حال پرداخت…' : 'پرداخت از کیف پول'}
                  </Btn>
                </div>
              </Card>
            )}

            {file.status === 'needs_fix' && !fixing && (
              <Btn onClick={() => setFixing(true)} full variant="soft" color={C.statusWarn}>
                اصلاح و ارسال دوباره
              </Btn>
            )}

            {fixing ? (
              <>
                <DynamicForm
                  form={file.form}
                  values={values}
                  files={files}
                  onChange={(key, value) => setValues((v) => ({ ...v, [key]: value }))}
                  onFiles={(key, list) => setFiles((f) => ({ ...f, [key]: list }))}
                />
                <Btn onClick={() => act('fix', toFormData(values, files), true)} disabled={busy} full>
                  {busy ? 'در حال ارسال…' : 'ارسال اصلاحات'}
                </Btn>
              </>
            ) : (
              <div style={{ display: 'grid', gap: S.s2 }}>
                <p style={{ margin: 0, fontSize: S.xs, fontWeight: 800, color: C.textStrong }}>اطلاعات ثبت‌شده</p>
                {fields.map((field: any) => (
                  <div
                    key={field.key}
                    style={{
                      display: 'flex', gap: S.s3, justifyContent: 'space-between',
                      padding: `${S.s2}px 0`, borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <span style={{ fontSize: S.xs, color: C.muted, flexShrink: 0 }}>{field.label}</span>
                    <span style={{ fontSize: S.xs, color: C.text, fontWeight: 700, textAlign: 'end', minWidth: 0 }}>
                      {displayValue(field, file.values?.[field.key])}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {file.timeline?.length > 0 && (
              <div style={{ display: 'grid', gap: S.s3 }}>
                <p style={{ margin: 0, fontSize: S.xs, fontWeight: 800, color: C.textStrong }}>روند رسیدگی</p>
                {file.timeline.map((event: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: S.s3 }}>
                    <IconBadge color={C.statusInfo} size={30}><Clock className="h-3.5 w-3.5" /></IconBadge>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: S.xs, fontWeight: 700, color: C.text }}>
                        {event.byName}
                      </p>
                      {event.note && (
                        <p style={{ margin: '3px 0 0', fontSize: S.xs, color: C.muted, lineHeight: 1.8 }}>
                          {event.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p style={{ margin: 0, fontSize: S.xs, color: C.statusDanger, lineHeight: 1.8 }}>{error}</p>
            )}

            {['submitted', 'in_progress', 'needs_fix'].includes(file.status) && !file.fee?.paidAt && (
              <Btn onClick={() => act('cancel')} disabled={busy} full variant="ghost" color={C.statusDanger}>
                لغو پرونده
              </Btn>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
