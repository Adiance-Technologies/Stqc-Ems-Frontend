import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Flex, HStack, VStack, Text, Heading, Icon,
  Button, IconButton, Input, InputGroup, InputLeftElement,
  Select, FormControl, FormLabel, NumberInput, NumberInputField,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Tag, Code, Tooltip, Spinner, Progress, Divider,
  SimpleGrid, useDisclosure, useToast,
} from '@chakra-ui/react';
import {
  FiSearch, FiPlus, FiDownload, FiTrash2, FiPackage, FiCheckCircle,
  FiClock, FiAlertCircle, FiCpu, FiWifi, FiRadio, FiArrowRight,
  FiCopy, FiInfo, FiActivity, FiKey, FiShield, FiLock,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import {
  createBatch, listBatches, getBatchStatus, listFirmwares,
  downloadBatchZip, deleteBatch, listProductModels, getMacStats,
  listPendingBatches, createFromPending, rejectPending,
} from '../actions/provisioningActions';

const MotionBox = motion(Box);

const FAMILY_OPTIONS = [
  { value: 'SECOS', label: 'SECOS — STQC compliant' },
  { value: 'AUGEN', label: 'AUGEN — Augentix standard' },
  { value: '4GBDP', label: '4GBDP — 4G body camera' },
  { value: 'WFBDP', label: 'WFBDP — WiFi body camera' },
];
const CONN_TYPES = [
  { value: 'Eth',  label: 'Ethernet', icon: FiCpu   },
  { value: 'WIFI', label: 'WiFi',     icon: FiWifi  },
  { value: '4G',   label: '4G',       icon: FiRadio },
];
// Batch-level statuses (also used for the status filter dropdown).
const STATUS_TONE = {
  generating:  { color: 'yellow', label: 'Generating', icon: FiClock },
  ready:       { color: 'cyan',   label: 'Ready',      icon: FiCheckCircle },
  in_progress: { color: 'orange', label: 'In progress',icon: FiClock },
  completed:   { color: 'green',  label: 'Completed',  icon: FiCheckCircle },
  failed:      { color: 'red',    label: 'Failed',     icon: FiAlertCircle },
  allocated:   { color: 'gray',   label: 'Allocated',  icon: FiClock },
  cancelled:   { color: 'gray',   label: 'Cancelled',  icon: FiAlertCircle },
};
// Device-level statuses — the per-device table reuses StatusPill, so these must
// be mapped too or they'd fall back and mislabel (e.g. verified → "Allocated").
const DEVICE_TONE = {
  pending:     { color: 'gray',   label: 'Pending',     icon: FiClock },
  provisioned: { color: 'cyan',   label: 'Provisioned', icon: FiCheckCircle },
  reserved:    { color: 'purple', label: 'Reserved',    icon: FiClock },
  burning:     { color: 'orange', label: 'Burning',     icon: FiActivity },
  verified:    { color: 'green',  label: 'Verified',    icon: FiCheckCircle },
};
const TONE = { ...STATUS_TONE, ...DEVICE_TONE };
const fmtTs  = (t) => (t ? new Date(t).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const fmtMac = (h) => !h ? '—' : (h.length === 12 ? [0,2,4,6,8,10].map(i => h.slice(i,i+2)).join(':').toUpperCase() : h);
const trunc  = (s, n = 16) => (s && s.length > n ? `${s.slice(0, n / 2)}…${s.slice(-n / 2)}` : (s || '—'));

// Fleet-wide HSM / trust references — shown read-only in the Create modal so
// operators (and audit reviewers) can see exactly which anchors back the batch.
// These four are intentionally separate concerns:
//   1. Device cert signing CA (EC P-256, signs device certs via GCP CAS)
//   2. Firmware/manifest signing key (RSA-2048, signs SHA256SUMS in batch ZIP)
//   3. ROTPK = SHA-224 of #2's pubkey, burned in every device's eFuse
//   4. Root CA hash = SHA-256(rootCA.der)[0:12], burned in eFuse alongside ROTPK
const CERT_CA_KEY_REF    = 'arcisai-intermediate-ca-hsm';
const FW_SIGNING_KEY_REF = 'firmware-signing-key-raw';
const ROTPK_HEX          = 'fe8a8d8a3ad13e15907bebb410ce418740cbbf1f2630f2b686fe2451';
const ROOT_CA_HASH_12    = '44EAC14753385146971F2BC3';

const Card = (props) => (
  <Box bg="surface.panel" border="1px solid" borderColor="surface.border"
       borderRadius="xl" boxShadow="panel" {...props} />
);

// Key-value row used in the audit drawer. Auto-skips empty values, optional copy button.
function KV({ k, v, copyable, mono = true, color }) {
  const empty = v == null || v === '';
  return (
    <Flex gap={3} fontSize="xs" align="start" wrap="wrap" py={1.5}
          borderBottom="1px dashed" borderColor="surface.border">
      <Text minW="160px" color="surface.subtle" fontWeight={500}>{k}</Text>
      <Box flex={1} minW={0}>
        {empty ? (
          <Text color="surface.subtle">—</Text>
        ) : (
          <HStack spacing={2} align="start">
            {mono ? (
              <Code fontSize="xs" wordBreak="break-all" whiteSpace="normal"
                    color={color || 'surface.strong'} bg="surface.panelAlt" borderColor="surface.border">
                {String(v)}
              </Code>
            ) : (
              <Text fontSize="xs" color={color || 'surface.strong'}>{String(v)}</Text>
            )}
            {copyable && (
              <Tooltip label="Copy">
                <IconButton aria-label="copy" size="2xs" variant="ghost" icon={<FiCopy />}
                  onClick={() => navigator.clipboard?.writeText(String(v))} />
              </Tooltip>
            )}
          </HStack>
        )}
      </Box>
    </Flex>
  );
}

// Test outcome badge — same shape across all 5 station tests
function TestRow({ name, value }) {
  const tone = value === 'pass' ? 'green' : value === 'fail' ? 'red' : 'gray';
  return (
    <Flex justify="space-between" align="center" py={1.5} borderBottom="1px dashed" borderColor="surface.border">
      <Text fontSize="xs" color="surface.muted">{name}</Text>
      <Tag size="sm" colorScheme={tone} variant="subtle" minW="56px" justifyContent="center">
        {value || '—'}
      </Tag>
    </Flex>
  );
}

const TEST_LABELS = {
  otpWrite:     'OTP write',
  otpReadback:  'OTP readback',
  certLoad:     'Cert load',
  tlsHandshake: 'TLS handshake',
  mtlsAuth:     'mTLS auth',
};

// Section heading for the audit drawer
function SectionHeading({ icon, children }) {
  return (
    <HStack mb={2}>
      {icon && <Icon as={icon} color="brand.600" boxSize={3.5} />}
      <Text fontSize="2xs" color="surface.muted" textTransform="uppercase" letterSpacing="0.08em" fontWeight={700}>
        {children}
      </Text>
    </HStack>
  );
}

function StatusPill({ status }) {
  // Never silently mislabel an unknown status as "Allocated" — show its real name.
  const meta = TONE[status] || { color: 'gray', label: status || 'unknown', icon: FiClock };
  return (
    <HStack
      px={2.5} py={1} bg={`${meta.color}.50`} borderRadius="full"
      border="1px solid" borderColor={`${meta.color}.200`} spacing={1.5}
      display="inline-flex"
    >
      <Icon as={meta.icon} color={`${meta.color}.600`} boxSize={3} />
      <Text fontSize="xs" fontWeight={600} color={`${meta.color}.700`}>{meta.label}</Text>
    </HStack>
  );
}

function StatStrip({ batches }) {
  const verified = batches.reduce((a, b) => a + (b.counts?.verified || 0), 0);
  const pending  = batches.reduce((a, b) => a + ((b.counts?.allocated || 0) + (b.counts?.provisioned || 0)), 0);
  const failed   = batches.reduce((a, b) => a + (b.counts?.failed || 0), 0);
  const totalDevices = batches.reduce((a, b) => a + (b.count || 0), 0);

  const items = [
    { label: 'Batches',  value: batches.length.toLocaleString(),    sub: `${totalDevices.toLocaleString()} devices`, icon: FiPackage,    color: 'brand'  },
    { label: 'Verified', value: verified.toLocaleString(),          sub: totalDevices ? `${((verified/totalDevices)*100).toFixed(1)}% pass rate` : '—', icon: FiCheckCircle, color: 'green' },
    { label: 'In flight',value: pending.toLocaleString(),           sub: 'allocated / awaiting burn', icon: FiClock,      color: 'yellow' },
    { label: 'Failed',   value: failed.toLocaleString(),            sub: totalDevices ? `${((failed/totalDevices)*100).toFixed(2)}% scrap` : '—', icon: FiAlertCircle, color: 'red' },
  ];
  return (
    <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4} mb={6}>
      {items.map((it) => (
        <Card key={it.label} p={5}>
          <Flex align="center" justify="space-between" mb={3}>
            <Box w="36px" h="36px" borderRadius="lg" bg={`${it.color}.50`} color={`${it.color}.600`}
                 border="1px solid" borderColor={`${it.color}.100`}
                 display="flex" alignItems="center" justifyContent="center">
              <Icon as={it.icon} boxSize={4} />
            </Box>
          </Flex>
          <Text fontSize="xs" color="surface.muted" textTransform="uppercase" letterSpacing="0.06em" fontWeight={600}>{it.label}</Text>
          <Text fontSize="2xl" fontWeight={700} color="surface.strong" mt={1} letterSpacing="-0.025em">{it.value}</Text>
          <Text fontSize="xs" color="surface.subtle" mt={1}>{it.sub}</Text>
        </Card>
      ))}
    </SimpleGrid>
  );
}

function EmptyBatches({ onCreate }) {
  return (
    <Card p={12}>
      <VStack spacing={4}>
        <Box w="64px" h="64px" borderRadius="2xl" bg="brand.50" color="brand.600"
             display="flex" alignItems="center" justifyContent="center"
             border="1px solid" borderColor="brand.100">
          <Icon as={FiPackage} boxSize={7} />
        </Box>
        <Box textAlign="center" maxW="md">
          <Heading size="md" mb={2}>No batches yet</Heading>
          <Text color="surface.muted" fontSize="sm">
            Create your first batch to begin manufacturing. Each batch generates per-device certs,
            allocates MACs from the pool, and packages everything into a signed ZIP for the burn station.
          </Text>
        </Box>
        <Button leftIcon={<FiPlus />} size="lg" onClick={onCreate}>Create first batch</Button>
      </VStack>
    </Card>
  );
}

function ConnTypePicker({ value, onChange, allowed, available, untyped = 0 }) {
  return (
    <SimpleGrid columns={3} spacing={3}>
      {CONN_TYPES.map((t) => {
        const ok = allowed.includes(t.value);
        const selected = value === t.value;
        // Typeless MACs are fungible — claimable for any type at allocation,
        // so include them in every type's "available" count when ok.
        const typed = available[t.value]?.available || 0;
        const avail = typed + (ok ? untyped : 0);
        return (
          <Box
            key={t.value}
            as="button"
            type="button"
            onClick={() => ok && onChange(t.value)}
            disabled={!ok}
            cursor={ok ? 'pointer' : 'not-allowed'}
            bg={selected ? 'brand.50' : 'surface.panel'}
            border="1.5px solid"
            borderColor={selected ? 'brand.500' : 'surface.border'}
            borderRadius="lg"
            px={3} py={4}
            opacity={ok ? 1 : 0.5}
            transition="all 0.15s ease"
            _hover={ok && !selected ? { bg: 'surface.hover', borderColor: 'surface.borderHi' } : {}}
            position="relative"
            boxShadow={selected ? '0 0 0 3px rgba(79,70,229,0.12)' : 'none'}
          >
            {selected && (
              <Box position="absolute" top={2} right={2}
                   w="18px" h="18px" borderRadius="full" bg="brand.600" color="white"
                   display="flex" alignItems="center" justifyContent="center"
                   fontSize="xs" fontWeight={700}>
                ✓
              </Box>
            )}
            <VStack spacing={1.5}>
              <Box w="36px" h="36px" borderRadius="lg"
                   bg={selected ? 'brand.100' : 'surface.panelAlt'}
                   color={selected ? 'brand.700' : 'surface.muted'}
                   display="flex" alignItems="center" justifyContent="center">
                <Icon as={t.icon} boxSize={5} />
              </Box>
              <Text fontSize="sm" fontWeight={700}
                    color={selected ? 'brand.700' : 'surface.strong'}>
                {t.label}
              </Text>
              <Text fontSize="2xs" fontWeight={500}
                    color={selected ? 'brand.700' : 'surface.subtle'}
                    fontFamily="mono">
                {avail.toLocaleString()} available
              </Text>
            </VStack>
          </Box>
        );
      })}
    </SimpleGrid>
  );
}

export default function ProvisioningPage() {
  const toast = useToast();
  const [batches, setBatches]       = useState([]);
  const [firmwares, setFirmwares]   = useState([]);
  const [productModels, setSkus]    = useState([]);
  const [macStats, setMacStats]     = useState({ total: 0, byType: {} });
  const [loading, setLoading]       = useState(true);
  // Pending ERP IWONs queued for firmware selection.
  const [pending, setPending]       = useState([]);
  const [fwSel, setFwSel]           = useState({});   // { iwonName: { modelNumber: fwVersion } }
  const [pendingBusy, setPendingBusy] = useState(''); // iwonName currently creating/rejecting

  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selected, setSelected]     = useState(null);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [detailDevice, setDetailDevice] = useState(null);
  const [deviceSearch, setDeviceSearch] = useState('');
  const drawer       = useDisclosure();
  const deviceModal  = useDisclosure();
  const create       = useDisclosure();

  const openDeviceDetail = (d) => { setDetailDevice(d); deviceModal.onOpen(); };
  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard?.writeText(String(text));
    toast({ status: 'success', title: `${label || 'Copied'}`, duration: 1200 });
  };

  const filteredBatchDevices = useMemo(() => {
    if (!deviceSearch) return selectedDevices;
    const q = deviceSearch.toLowerCase();
    return selectedDevices.filter((d) =>
      (d.deviceId || '').toLowerCase().includes(q) ||
      (d.certHash || '').toLowerCase().includes(q) ||
      (d.metadata?.macAddress || '').toLowerCase().includes(q)
    );
  }, [selectedDevices, deviceSearch]);

  const exportCsv = () => {
    if (!selectedDevices.length) return;
    const fwForBatch = selected?.firmwareVersion || '';
    const headers = 'Device ID,Status,OTP Hex,Cert Hash,Cert Serial,MAC,Firmware,Burned At,Verified At\n';
    const rows = selectedDevices.map((d) => [
      d.deviceId,
      d.status,
      d.otpEncoded || '',
      d.certHash || '',
      d.certSerial || '',
      (Array.isArray(d.macs) && d.macs.length
        ? d.macs.map((m) => `${m.type}:${fmtMac(m.mac)}`).join(' ')
        : fmtMac(d.metadata?.macAddress)) || '',
      d.metadata?.firmwareVersion || fwForBatch,
      d.burnedAt || '',
      d.verifiedAt || '',
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_${selected?.batchId || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [iwon, setIwon]         = useState('');
  const [family, setFamily]     = useState('SECOS');
  const [firmware, setFirmware] = useState('');
  const [count, setCount]       = useState(100);
  const [creating, setCreating] = useState(false);

  useEffect(() => { (async () => {
    setLoading(true);
    const [b, f, s, m, p] = await Promise.all([
      listBatches(), listFirmwares(), listProductModels(), getMacStats(), listPendingBatches(),
    ]);
    if (b?.batches) setBatches(b.batches);
    if (f?.firmwares) {
      setFirmwares(f.firmwares);
      if (f.firmwares.length) setFirmware((cur) => cur || f.firmwares[0].version);
    }
    if (s?.models) setSkus(s.models);
    if (m?.byType) setMacStats(m);
    if (p?.pending) setPending(p.pending);
    setLoading(false);
  })(); /* eslint-disable-next-line */ }, []);

  const refreshAll = async () => {
    const [b, m, p] = await Promise.all([listBatches(), getMacStats(), listPendingBatches()]);
    if (b?.batches) setBatches(b.batches);
    if (m?.byType) setMacStats(m);
    if (p?.pending) setPending(p.pending);
  };

  // Firmware chosen per (iwonName, modelNumber); falls back to the SKU's suggestion.
  const fwFor = (iwonName, item) => (fwSel[iwonName]?.[item.modelNumber]) ?? (item.suggestedFirmware || '');
  const setFwFor = (iwonName, modelNumber, version) =>
    setFwSel((cur) => ({ ...cur, [iwonName]: { ...(cur[iwonName] || {}), [modelNumber]: version } }));

  const handleCreatePending = async (p) => {
    const creatable = p.items.filter((it) => !it.resolveError);
    if (!creatable.length) { toast({ status: 'error', title: 'No valid models to create' }); return; }
    const missing = creatable.filter((it) => !fwFor(p.iwonName, it));
    if (missing.length) { toast({ status: 'error', title: 'Pick firmware for every model first' }); return; }
    const firmwares = {};
    creatable.forEach((it) => { firmwares[it.modelNumber] = fwFor(p.iwonName, it); });
    setPendingBusy(p.iwonName);
    const r = await createFromPending(p.iwonName, firmwares);
    setPendingBusy('');
    if (r?.success) {
      toast({ status: 'success', title: `Creating ${r.accepted?.length || 0} batch(es) for ${p.iwonName}`,
              description: r.failed?.length ? `Skipped: ${r.failed.join('; ')}` : 'Generation started' });
      refreshAll();
    } else {
      toast({ status: 'error', title: r?.message || 'Failed to create batches' });
    }
  };

  const handleRejectPending = async (p) => {
    if (!window.confirm(`Reject IWON ${p.iwonName}? It will be removed from the EMS queue (ERP is not notified).`)) return;
    setPendingBusy(p.iwonName);
    const r = await rejectPending(p.iwonName, '');
    setPendingBusy('');
    if (r?.success) { toast({ status: 'info', title: `IWON ${p.iwonName} rejected` }); refreshAll(); }
    else { toast({ status: 'error', title: r?.message || 'Failed to reject' }); }
  };

  // Manual batches no longer take a model/connection/range — the device-ID range
  // is auto-allocated server-side and the manual flow is Ethernet (one MAC/device).

  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      if (statusFilter && b.status !== statusFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (b.batchId || '').toLowerCase().includes(q)
          || (b.iwonName || '').toLowerCase().includes(q)
          || (b.productModel || '').toLowerCase().includes(q)
          || (b.family || '').toLowerCase().includes(q);
    });
  }, [batches, search, statusFilter]);

  const handleViewBatch = async (batchId) => {
    setDeviceSearch(''); // reset filter when opening a different batch
    const r = await getBatchStatus(batchId);
    if (r?.batchId) {
      setSelected(r);
      setSelectedDevices(r.devices || []);
      drawer.onOpen();
    } else {
      toast({ status: 'error', title: r?.message || 'Failed to load batch' });
    }
  };

  // Live-poll the open batch every 5s — verified counts climb in real time
  // as stations call /api/provision/verify on the backend.
  useEffect(() => {
    if (!drawer.isOpen || !selected?.batchId) return;
    const id = setInterval(async () => {
      const r = await getBatchStatus(selected.batchId);
      if (r?.batchId) {
        setSelected(r);
        setSelectedDevices(r.devices || []);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [drawer.isOpen, selected?.batchId]);

  // Live-refresh the batches table every 30s while page is open
  useEffect(() => {
    const id = setInterval(refreshAll, 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, []);

  const handleCreate = async () => {
    if (!iwon || !family || !firmware || !count) {
      toast({ status: 'error', title: 'IWON, family, firmware and count are required' });
      return;
    }
    if (!/^[A-Za-z0-9_-]{3,64}$/.test(iwon.trim())) {
      toast({ status: 'error', title: 'IWON must be 3–64 chars (letters, digits, - or _)' });
      return;
    }
    setCreating(true);
    // Model comes from ERP; manual batches are Ethernet (one MAC/device) and the
    // device-ID range is auto-allocated server-side per family.
    const r = await createBatch({
      iwon: iwon.trim(), family, firmwareVersion: firmware, count: parseInt(count, 10),
    });
    setCreating(false);
    if (r?.batchId) {
      toast({ status: 'success', title: `Batch ${r.batchId} queued`, description: `Generating ${r.count} devices` });
      create.onClose();
      setIwon('');
      refreshAll();
    } else {
      toast({ status: 'error', title: r?.message || 'Failed to create batch' });
    }
  };

  const handleDownload = async (batchId) => {
    const r = await downloadBatchZip(batchId);
    if (!r?.success) toast({ status: 'error', title: r?.message || 'Download failed' });
  };

  const handleDelete = async (batchId) => {
    if (!window.confirm(`Delete batch ${batchId}? Allocated MACs return to the pool. Burned devices stay burned.`)) return;
    const r = await deleteBatch(batchId);
    if (r?.ok) {
      toast({ status: 'success', title: 'Batch deleted' });
      drawer.onClose();
      refreshAll();
    } else {
      toast({ status: 'error', title: r?.message || 'Delete failed' });
    }
  };

  if (loading) {
    return <Flex h="100%" align="center" justify="center"><Spinner size="xl" color="brand.600" thickness="3px" /></Flex>;
  }

  return (
    <Box p={{ base: 4, lg: 8 }} maxW="1400px" mx="auto">
      {/* Header */}
      <MotionBox initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} mb={6}>
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} flexDir={{ base: 'column', md: 'row' }} gap={4}>
          <Box>
            <HStack spacing={2} mb={2}>
              <Box w="6px" h="6px" borderRadius="full" bg="semantic.success" />
              <Text fontSize="xs" color="brand.700" textTransform="uppercase" letterSpacing="0.18em" fontWeight={700}>
                Provisioning
              </Text>
            </HStack>
            <Heading size="xl" letterSpacing="-0.03em">Batches</Heading>
            <Text color="surface.muted" mt={1} fontSize="sm">
              Create work orders, allocate MACs, and ship signed ZIPs to manufacturing stations.
            </Text>
          </Box>
          <Button leftIcon={<FiPlus />} size="lg" onClick={create.onOpen}>
            New batch
          </Button>
        </Flex>
      </MotionBox>

      {/* KPI strip */}
      <StatStrip batches={batches} />

      {/* Pending ERP IWONs — operator chooses firmware per model, then creates */}
      {pending.length > 0 && (
        <Card mb={4} borderColor="purple.200" borderWidth="1px">
          <Flex p={4} borderBottom="1px solid" borderColor="surface.border" align="center" gap={2} flexWrap="wrap">
            <Icon as={FiClock} color="purple.500" />
            <Heading size="sm">Pending from ERP</Heading>
            <Tag size="sm" colorScheme="purple" variant="subtle">{pending.length}</Tag>
            <Text fontSize="xs" color="surface.subtle" ml={2}>Accepted in ERP — choose firmware per model, then create the batches.</Text>
          </Flex>
          {pending.map((p) => (
            <Box key={p.iwonName} p={4} _notLast={{ borderBottom: '1px solid', borderColor: 'surface.border' }}>
              <Flex align="center" mb={3} gap={2} flexWrap="wrap">
                <Code colorScheme="purple" fontSize="sm">{p.iwonName}</Code>
                <Tag size="sm" variant="subtle">{p.items.length} model(s)</Tag>
                <Tag size="sm" variant="subtle">qty {p.totalQuantity}</Tag>
                <Box flex={1} />
                <Button size="sm" variant="outline" colorScheme="red"
                        isDisabled={pendingBusy === p.iwonName}
                        onClick={() => handleRejectPending(p)}>Reject</Button>
                <Button size="sm" leftIcon={<FiPlus />} isLoading={pendingBusy === p.iwonName}
                        onClick={() => handleCreatePending(p)}>Create batches</Button>
              </Flex>
              <TableContainer>
                <Table size="sm" variant="simple">
                  <Thead bg="surface.panelAlt"><Tr>
                    <Th>Model</Th><Th isNumeric>Qty</Th><Th>Family</Th><Th>MACs</Th><Th>Firmware</Th>
                  </Tr></Thead>
                  <Tbody>
                    {p.items.map((it, i) => (
                      <Tr key={i}>
                        <Td><Code fontSize="2xs">{it.modelNumber}</Code></Td>
                        <Td isNumeric>{it.quantity}</Td>
                        <Td>{it.family ? <Tag size="sm" colorScheme="brand" variant="subtle">{it.family}</Tag> : '—'}</Td>
                        <Td>
                          {it.resolveError
                            ? <Text fontSize="2xs" color="red.500">{it.resolveError}</Text>
                            : (it.macTypes || []).map((t) => (
                                <Tag key={t} size="sm" mr={1} variant="subtle" colorScheme={t === 'WIFI' ? 'orange' : 'cyan'}>{t}</Tag>))}
                        </Td>
                        <Td>
                          {it.resolveError ? '—' : (
                            <Select size="sm" maxW="220px" value={fwFor(p.iwonName, it)}
                                    onChange={(e) => setFwFor(p.iwonName, it.modelNumber, e.target.value)}>
                              <option value="">Select firmware</option>
                              {firmwares.map((f) => (<option key={f.version} value={f.version}>{f.version}</option>))}
                            </Select>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </Card>
      )}

      {batches.length === 0 ? (
        <EmptyBatches onCreate={create.onOpen} />
      ) : (
        <Card>
          {/* Toolbar */}
          <Flex p={4} borderBottom="1px solid" borderColor="surface.border" gap={3} flexWrap="wrap">
            <InputGroup maxW="320px">
              <InputLeftElement><Icon as={FiSearch} color="surface.subtle" /></InputLeftElement>
              <Input placeholder="Search batch ID, IWON, SKU, family…"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </InputGroup>
            <Select maxW="180px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              {Object.keys(STATUS_TONE).map((s) => (
                <option key={s} value={s}>{STATUS_TONE[s].label}</option>
              ))}
            </Select>
            <Box flex={1} />
            <Text fontSize="xs" color="surface.subtle" alignSelf="center">
              {filteredBatches.length} of {batches.length}
            </Text>
          </Flex>

          {/* Table */}
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead bg="surface.panelAlt">
                <Tr>
                  <Th>Batch ID</Th>
                  <Th>IWON</Th>
                  <Th>SKU</Th>
                  <Th>Family</Th>
                  <Th>Firmware</Th>
                  <Th>Conn</Th>
                  <Th isNumeric>Devices</Th>
                  <Th>Progress</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredBatches.map((b) => {
                  const verifiedPct = ((b.counts?.verified || 0) / Math.max(b.count, 1)) * 100;
                  return (
                    <Tr key={b.batchId} _hover={{ bg: 'surface.hover', cursor: 'pointer' }}
                        onClick={() => handleViewBatch(b.batchId)}>
                      <Td>
                        <HStack>
                          <Box w="32px" h="32px" borderRadius="md" bg="brand.50" color="brand.600"
                               display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                            <Icon as={FiPackage} boxSize={3.5} />
                          </Box>
                          <Code fontFamily="mono" fontSize="xs" colorScheme="brand">{b.batchId}</Code>
                          <Tag size="sm" variant="subtle" colorScheme={b.source === 'erp' ? 'purple' : 'gray'}>
                            {b.source === 'erp' ? 'ERP' : 'UI'}
                          </Tag>
                        </HStack>
                      </Td>
                      <Td>
                        {b.iwonName
                          ? <Code fontFamily="mono" fontSize="2xs" colorScheme="purple">{b.iwonName}</Code>
                          : <Text fontSize="xs" color="surface.subtle">—</Text>}
                      </Td>
                      <Td><Text fontSize="xs" color="surface.muted">{b.productModel}</Text></Td>
                      <Td><Tag size="sm" colorScheme="brand" variant="subtle">{b.family}</Tag></Td>
                      <Td><Text fontSize="xs" color="surface.muted" fontFamily="mono">{b.firmwareVersion}</Text></Td>
                      <Td>{b.connectionType ? <Tag size="sm" colorScheme="cyan" variant="subtle">{b.connectionType}</Tag> : '—'}</Td>
                      <Td isNumeric><Text fontWeight={600}>{b.count}</Text></Td>
                      <Td>
                        <Box minW="90px">
                          <Progress value={verifiedPct} size="xs" colorScheme="green" borderRadius="full" />
                          <Text fontSize="2xs" color="surface.subtle" mt={1} fontFamily="mono">
                            {b.counts?.verified || 0}/{b.count}
                          </Text>
                        </Box>
                      </Td>
                      <Td><StatusPill status={b.status} /></Td>
                      <Td><Text fontSize="xs" color="surface.subtle">{fmtTs(b.createdAt)}</Text></Td>
                      <Td>
                        <HStack spacing={1} onClick={(e) => e.stopPropagation()}>
                          {(b.status === 'ready' || b.status === 'in_progress' || b.status === 'completed') && (
                            <Tooltip label="Download ZIP">
                              <IconButton aria-label="download" size="sm" variant="ghost"
                                icon={<FiDownload />} onClick={() => handleDownload(b.batchId)} />
                            </Tooltip>
                          )}
                          <Tooltip label="View detail">
                            <IconButton aria-label="view" size="sm" variant="ghost"
                              icon={<FiArrowRight />} onClick={() => handleViewBatch(b.batchId)} />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
                {filteredBatches.length === 0 && (
                  <Tr><Td colSpan={11}><Text textAlign="center" py={6} color="surface.subtle">No batches match.</Text></Td></Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ── Batch Detail Drawer ────────────────────────────── */}
      <Drawer isOpen={drawer.isOpen} placement="right" size="xl" onClose={drawer.onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px solid" borderColor="surface.border">
            {selected && (
              <VStack align="start" spacing={2}>
                <StatusPill status={selected.status} />
                <Code fontSize="lg" colorScheme="brand">{selected.batchId}</Code>
                <Text fontSize="sm" color="surface.muted" fontWeight={400}>
                  {selected.productModel} · {selected.family} · {selected.firmwareVersion}
                </Text>
              </VStack>
            )}
          </DrawerHeader>
          <DrawerBody py={6}>
            {selected && (
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={4} spacing={3}>
                  {[
                    { l: 'Total',       n: selected.count,                          c: 'gray'   },
                    { l: 'Verified',    n: selected.counts?.verified || 0,          c: 'green'  },
                    { l: 'Provisioned', n: selected.counts?.provisioned || 0,       c: 'cyan'   },
                    { l: 'Failed',      n: selected.counts?.failed || 0,            c: 'red'    },
                  ].map((s) => (
                    <Box key={s.l} p={3} bg={`${s.c}.50`} border="1px solid" borderColor={`${s.c}.100`} borderRadius="lg">
                      <Text fontSize="2xs" color={`${s.c}.700`} textTransform="uppercase" letterSpacing="0.06em" fontWeight={700}>{s.l}</Text>
                      <Text fontSize="2xl" fontWeight={700} color={`${s.c}.700`} letterSpacing="-0.02em">{s.n}</Text>
                    </Box>
                  ))}
                </SimpleGrid>

                {selected.count > 0 && (
                  <Box>
                    <Flex justify="space-between" mb={1.5}>
                      <Text fontSize="2xs" color="surface.muted" textTransform="uppercase" letterSpacing="0.06em" fontWeight={700}>
                        Verification progress
                      </Text>
                      <Text fontSize="xs" color="surface.muted" fontFamily="mono">
                        {selected.counts?.verified || 0} / {selected.count} ({(((selected.counts?.verified || 0) / selected.count) * 100).toFixed(1)}%)
                      </Text>
                    </Flex>
                    <Progress
                      value={((selected.counts?.verified || 0) / selected.count) * 100}
                      colorScheme="green" size="sm" borderRadius="full"
                    />
                  </Box>
                )}

                {/* Error banner if generation failed */}
                {selected.error && (
                  <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg" p={3}>
                    <HStack align="start" spacing={2}>
                      <Icon as={FiAlertCircle} color="red.600" mt={0.5} />
                      <Box flex={1}>
                        <Text fontSize="xs" color="red.700" textTransform="uppercase" letterSpacing="0.06em" fontWeight={700} mb={1}>
                          Generation error
                        </Text>
                        <Code fontSize="xs" colorScheme="red" whiteSpace="pre-wrap" wordBreak="break-all">
                          {selected.error}
                        </Code>
                      </Box>
                    </HStack>
                  </Box>
                )}

                <Card p={4}>
                  <Heading size="xs" textTransform="uppercase" letterSpacing="0.06em" color="surface.muted" mb={3}>
                    Batch metadata
                  </Heading>
                  <Box>
                    <KV k="Range"           v={`${selected.startDeviceId} → ${selected.endDeviceId}`} mono={false} />
                    <KV k="Connection"      v={selected.connectionType} mono={false} />
                    <KV k="Firmware path"   v={selected.firmwarePath} />
                    <KV k="Firmware SHA-256" v={selected.firmwareSha256} copyable />
                    <KV k="HSM Cert CA"     v={selected.hsmKeyRef} copyable />
                    <KV k="ROTPK"           v={selected.rotpkHex} copyable />
                    <KV k="Root CA hash"    v={selected.rootCaHash?.hex || selected.rootCaHash} copyable />
                    <KV k="Created by"      v={selected.createdBy} mono={false} />
                    <KV k="Created at"      v={fmtTs(selected.createdAt)} mono={false} />
                    <KV k="Generated at"    v={fmtTs(selected.generatedAt)} mono={false} />
                    <KV k="ZIP path"        v={selected.zipPath} />
                    <KV k="ZIP SHA-256"     v={selected.zipSha256} copyable />
                    <KV k="ZIP size"        v={selected.zipSizeBytes ? `${(selected.zipSizeBytes / 1024 / 1024).toFixed(2)} MB` : null} mono={false} />
                    <KV k="Download count"  v={selected.downloadCount ?? 0} mono={false} />
                    <KV k="First download"  v={fmtTs(selected.firstDownloadedAt)} mono={false} />
                  </Box>
                </Card>

                <HStack>
                  {(selected.status === 'ready' || selected.status === 'in_progress' || selected.status === 'completed') && (
                    <Button leftIcon={<FiDownload />} flex={1} onClick={() => handleDownload(selected.batchId)}>
                      Download ZIP
                    </Button>
                  )}
                  <Button leftIcon={<FiTrash2 />} variant="outline"
                          color="red.600" borderColor="red.200"
                          _hover={{ bg: 'red.50', borderColor: 'red.300' }}
                          onClick={() => handleDelete(selected.batchId)}>
                    Delete
                  </Button>
                </HStack>

                <Card>
                  <Flex p={4} borderBottom="1px solid" borderColor="surface.border" gap={3} flexWrap="wrap" align="center">
                    <Heading size="xs" textTransform="uppercase" letterSpacing="0.06em" color="surface.muted">
                      Devices ({filteredBatchDevices.length} of {selectedDevices.length})
                    </Heading>
                    <Box flex={1} />
                    <InputGroup size="sm" maxW="240px">
                      <InputLeftElement><Icon as={FiSearch} color="surface.subtle" /></InputLeftElement>
                      <Input placeholder="Search ID / hash / MAC…"
                        value={deviceSearch} onChange={(e) => setDeviceSearch(e.target.value)} />
                    </InputGroup>
                    <Button size="sm" variant="outline" leftIcon={<FiDownload />} onClick={exportCsv}>
                      Export CSV
                    </Button>
                  </Flex>
                  <TableContainer maxH="450px" overflowY="auto">
                    <Table size="sm" variant="simple">
                      <Thead bg="surface.panelAlt" position="sticky" top={0} zIndex={1}>
                        <Tr>
                          <Th>#</Th>
                          <Th>Device ID</Th>
                          <Th>Status</Th>
                          <Th>Burn stage</Th>
                          <Th>OTP hex</Th>
                          <Th>Cert hash</Th>
                          <Th>Cert serial</Th>
                          <Th>MAC</Th>
                          <Th>Verified at</Th>
                          <Th></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredBatchDevices.map((d, i) => (
                          <Tr key={d.deviceId}
                              _hover={{ bg: 'surface.hover', cursor: 'pointer' }}
                              onClick={() => openDeviceDetail(d)}>
                            <Td color="surface.subtle" fontSize="xs">{i + 1}</Td>
                            <Td>
                              <HStack spacing={1}>
                                <Code fontSize="2xs" colorScheme={d.status === 'failed' ? 'red' : 'brand'}>{d.deviceId}</Code>
                                <IconButton aria-label="copy device id" size="2xs" variant="ghost"
                                  icon={<FiCopy />}
                                  onClick={(e) => { e.stopPropagation(); copyToClipboard(d.deviceId, 'Device ID'); }} />
                              </HStack>
                            </Td>
                            <Td><StatusPill status={d.status} /></Td>
                            <Td onClick={(e) => e.stopPropagation()}>
                              {d.stages ? (
                                <HStack spacing={0.5}>
                                  {[['started','Start'],['efuse','eFuse'],['flash','Flash'],['certBurned','Cert'],['macBurned','MAC'],['completed','Done']].map(([k, lbl]) => (
                                    <Tag key={k} size="sm" variant="subtle"
                                         colorScheme={d.stages?.[k]?.done ? 'green' : 'gray'}
                                         title={d.stages?.[k]?.done ? `${lbl} ✓ ${d.stages[k].at ? new Date(d.stages[k].at).toLocaleString() : ''}` : `${lbl}: pending`}>
                                      {lbl}
                                    </Tag>
                                  ))}
                                </HStack>
                              ) : (
                                <Text fontSize="2xs" color="surface.subtle">—</Text>
                              )}
                            </Td>
                            <Td><Code fontSize="2xs" colorScheme="orange">{d.otpEncoded || '—'}</Code></Td>
                            <Td>
                              <Tooltip label={d.certHash || 'no hash'}>
                                <HStack spacing={1}>
                                  <Code fontSize="2xs" colorScheme="green">{trunc(d.certHash, 16)}</Code>
                                  {d.certHash && (
                                    <IconButton aria-label="copy cert hash" size="2xs" variant="ghost"
                                      icon={<FiCopy />}
                                      onClick={(e) => { e.stopPropagation(); copyToClipboard(d.certHash, 'Cert hash'); }} />
                                  )}
                                </HStack>
                              </Tooltip>
                            </Td>
                            <Td><Code fontSize="2xs" color="surface.muted">{trunc(d.certSerial, 14)}</Code></Td>
                            <Td>
                              {Array.isArray(d.macs) && d.macs.length ? (
                                <VStack align="start" spacing={0.5}>
                                  {d.macs.map((m, mi) => (
                                    <HStack key={mi} spacing={1}>
                                      <Tag size="sm" variant="subtle" colorScheme={m.type === 'WIFI' ? 'orange' : 'cyan'}>{m.type}</Tag>
                                      <Text fontSize="2xs" fontFamily="mono" color="surface.muted">{fmtMac(m.mac)}</Text>
                                    </HStack>
                                  ))}
                                </VStack>
                              ) : (
                                <Text fontSize="2xs" fontFamily="mono" color="surface.muted">{fmtMac(d.metadata?.macAddress)}</Text>
                              )}
                            </Td>
                            <Td><Text fontSize="xs" color="surface.subtle">{fmtTs(d.verifiedAt)}</Text></Td>
                            <Td onClick={(e) => e.stopPropagation()}>
                              <Tooltip label="Audit trail">
                                <IconButton aria-label="audit" size="xs" variant="ghost"
                                  icon={<FiInfo />} onClick={() => openDeviceDetail(d)} />
                              </Tooltip>
                            </Td>
                          </Tr>
                        ))}
                        {filteredBatchDevices.length === 0 && (
                          <Tr><Td colSpan={10}><Text textAlign="center" py={6} color="surface.subtle">
                            {selectedDevices.length === 0 ? 'No devices yet.' : 'No devices match the search.'}
                          </Text></Td></Tr>
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Card>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* ── Create Batch Modal ─────────────────────────────── */}
      <Modal isOpen={create.isOpen} onClose={create.onClose} size="2xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader pb={2}>
            <Box>
              <Heading size="md">New batch</Heading>
              <Text fontSize="sm" color="surface.muted" fontWeight={400} mt={1}>
                IWON-driven · MACs allocated atomically · ZIP signed by HSM on completion.
              </Text>
            </Box>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={2}>
            <VStack spacing={5} align="stretch">

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight={600}>
                  IWON Number
                  <Tag size="sm" ml={2} colorScheme="brand" variant="subtle">becomes batch ID</Tag>
                </FormLabel>
                <Input
                  size="lg" value={iwon} onChange={(e) => setIwon(e.target.value)}
                  placeholder="enter IWON from production planning"
                  fontFamily="mono"
                />
                <Text fontSize="xs" color="surface.subtle" mt={1.5}>
                  3–64 chars: letters, digits, hyphen, underscore. Must be unique.
                </Text>
              </FormControl>

              <Divider />

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight={600}>Device family</FormLabel>
                  <Select size="lg" value={family} onChange={(e) => setFamily(e.target.value)}>
                    {FAMILY_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight={600}>Count</FormLabel>
                  <NumberInput size="lg" value={count} onChange={(_, v) => setCount(v)} min={1} max={10000}>
                    <NumberInputField fontFamily="mono" />
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight={600}>Firmware</FormLabel>
                <Select size="lg" value={firmware} onChange={(e) => setFirmware(e.target.value)} placeholder="Select firmware">
                  {firmwares.map((f) => (
                    <option key={f.version} value={f.version}>
                      {f.version}{f.files.length > 0 && ` — ${f.files[0]}`}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <Box p={3} bg="surface.panelAlt" borderRadius="md">
                <Text fontSize="xs" color="surface.subtle">
                  Product model comes from ERP — not selected here. Manual batches use
                  Ethernet (one MAC per device); the device-ID range is auto-allocated
                  per family as <Code fontSize="2xs">ATPL-NNNNNN-FAMILY</Code>.
                </Text>
              </Box>

              <Divider />

              {/* ── HSM / Trust anchors (read-only, audit reference) ───── */}
              <Box>
                <HStack mb={1.5}>
                  <Icon as={FiLock} color="brand.600" boxSize={3.5} />
                  <Text fontSize="xs" color="surface.muted" textTransform="uppercase" letterSpacing="0.08em" fontWeight={700}>
                    HSM &amp; Trust Anchors
                  </Text>
                  <Tag size="sm" colorScheme="gray" variant="subtle">read-only</Tag>
                </HStack>
                <Text fontSize="xs" color="surface.subtle" mb={3}>
                  Fleet-wide cryptographic anchors that will back every device in this batch.
                </Text>

                <VStack spacing={3} align="stretch">
                  <FormControl>
                    <FormLabel fontSize="xs" mb={1} color="surface.muted">
                      Device Cert Signing CA
                      <Text as="span" color="surface.subtle" fontWeight={400} ml={2}>
                        — GCP CAS · EC P-256 · signs each device cert
                      </Text>
                    </FormLabel>
                    <Input value={CERT_CA_KEY_REF} isReadOnly fontFamily="mono" size="sm"
                           bg="surface.panelAlt" />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" mb={1} color="surface.muted">
                      Firmware / Manifest Signing Key
                      <Text as="span" color="surface.subtle" fontWeight={400} ml={2}>
                        — RSA-2048 · signs FW + batch SHA256SUMS
                      </Text>
                    </FormLabel>
                    <Input value={FW_SIGNING_KEY_REF} isReadOnly fontFamily="mono" size="sm"
                           bg="surface.panelAlt" />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" mb={1} color="surface.muted">
                      ROTPK
                      <Text as="span" color="surface.subtle" fontWeight={400} ml={2}>
                        — SHA-224(firmware-pubkey) · burned in eFuse for secure-boot pin
                      </Text>
                    </FormLabel>
                    <Input value={ROTPK_HEX} isReadOnly fontFamily="mono" fontSize="xs" size="sm"
                           bg="surface.panelAlt" />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs" mb={1} color="surface.muted">
                      Root CA Hash (OTP pin)
                      <Text as="span" color="surface.subtle" fontWeight={400} ml={2}>
                        — SHA-256(rootCA.der)[0:12] · burned alongside ROTPK
                      </Text>
                    </FormLabel>
                    <Input value={ROOT_CA_HASH_12} isReadOnly fontFamily="mono" fontSize="xs" size="sm"
                           bg="surface.panelAlt" />
                  </FormControl>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="surface.border" mt={4}>
            <Button variant="ghost" mr={3} onClick={create.onClose}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={creating} isDisabled={!iwon || !family || !firmware} size="lg">
              Generate batch
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Device Audit Modal ─────────────────────────────── */}
      <Modal isOpen={deviceModal.isOpen} onClose={deviceModal.onClose} size="3xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader pb={3} borderBottom="1px solid" borderColor="surface.border">
            {detailDevice && (
              <VStack align="start" spacing={1.5}>
                <HStack spacing={2}>
                  <Box w="32px" h="32px" borderRadius="md" bg="brand.50" color="brand.600"
                       border="1px solid" borderColor="brand.100"
                       display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiInfo} boxSize={4} />
                  </Box>
                  <Heading size="sm">Device audit trail</Heading>
                </HStack>
                <HStack>
                  <Code fontSize="md" colorScheme="brand">{detailDevice.deviceId}</Code>
                  <StatusPill status={detailDevice.status} />
                </HStack>
              </VStack>
            )}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={5}>
            {detailDevice ? (
              <VStack align="stretch" spacing={6}>
                {/* Identity */}
                <Box>
                  <SectionHeading icon={FiCpu}>Identity</SectionHeading>
                  <Box bg="surface.panelAlt" border="1px solid" borderColor="surface.border" borderRadius="lg" p={3}>
                    <KV k="Device ID"     v={detailDevice.deviceId}     copyable />
                    <KV k="Serial number" v={detailDevice.serialNumber} mono={false} />
                    <KV k="Suffix"        v={detailDevice.suffix}       mono={false} />
                    <KV k="Family"        v={detailDevice.family || selected?.family} mono={false} />
                    <KV k="Family code"   v={detailDevice.familyCode}   mono={false} />
                    <KV k="Product Model" v={detailDevice.productModel || selected?.productModel} mono={false} />
                  </Box>
                </Box>

                {/* OTP */}
                <Box>
                  <SectionHeading icon={FiKey}>OTP / eFuse</SectionHeading>
                  <Box bg="surface.panelAlt" border="1px solid" borderColor="surface.border" borderRadius="lg" p={3}>
                    <KV k="OTP encoded"  v={detailDevice.otpEncoded} copyable />
                    <KV k="OTP readback" v={detailDevice.metadata?.otpReadback} copyable />
                  </Box>
                </Box>

                {/* Cert */}
                <Box>
                  <SectionHeading icon={FiShield}>Certificate (GCP CAS)</SectionHeading>
                  <Box bg="surface.panelAlt" border="1px solid" borderColor="surface.border" borderRadius="lg" p={3}>
                    <KV k="Cert hash (SHA-256)" v={detailDevice.certHash}        copyable />
                    <KV k="Cert serial #"       v={detailDevice.certSerial}      copyable />
                    <KV k="Cert fingerprint"    v={detailDevice.certFingerprint} copyable />
                    <KV k="GCP CAS resource"    v={detailDevice.certGcpName}     copyable />
                    <KV k="Algorithm"           v={detailDevice.certAlgorithm || 'EC_SIGN_P256_SHA256'} mono={false} />
                    <KV k="Issuer"              v={detailDevice.certIssuer || selected?.hsmKeyRef} />
                    <KV k="Not before"          v={fmtTs(detailDevice.certNotBefore)} mono={false} />
                    <KV k="Not after"           v={fmtTs(detailDevice.certNotAfter)}  mono={false} />
                  </Box>
                </Box>

                {/* Burn / Verification */}
                <Box>
                  <SectionHeading icon={FiActivity}>Burn / verification</SectionHeading>
                  <Box bg="surface.panelAlt" border="1px solid" borderColor="surface.border" borderRadius="lg" p={3}>
                    <KV k="Status"        v={detailDevice.status} mono={false} />
                    <KV k="Burned at"     v={fmtTs(detailDevice.burnedAt)}   mono={false} />
                    <KV k="Verified at"   v={fmtTs(detailDevice.verifiedAt)} mono={false} />
                    <KV k="Station"       v={detailDevice.metadata?.station} />
                    <KV k="Jig slot"      v={detailDevice.metadata?.jigSlot} mono={false} />
                    <KV k="Firmware ver"  v={detailDevice.metadata?.firmwareVersion || selected?.firmwareVersion} />
                    <KV k="MAC (assigned)" v={fmtMac(detailDevice.metadata?.macAddress)} copyable />
                    <KV k="SE chip present" v={detailDevice.metadata?.seChipPresent != null
                        ? String(detailDevice.metadata.seChipPresent) : null} mono={false} />
                    <KV k="Vendor OTP ID" v={detailDevice.metadata?.vendorOtpId} copyable />
                  </Box>
                </Box>

                {/* Tests */}
                {detailDevice.tests && (
                  <Box>
                    <SectionHeading icon={FiCheckCircle}>Test results</SectionHeading>
                    <Box bg="surface.panelAlt" border="1px solid" borderColor="surface.border" borderRadius="lg" p={3}>
                      {Object.entries(detailDevice.tests).map(([k, v]) => (
                        <TestRow key={k} name={TEST_LABELS[k] || k} value={v} />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Raw JSON dump */}
                <Box>
                  <SectionHeading icon={FiInfo}>Raw record (audit JSON)</SectionHeading>
                  <Box bg="#0F1525" color="#E5E7EB" border="1px solid" borderColor="surface.border"
                       borderRadius="lg" p={3} maxH="300px" overflowY="auto">
                    <Code as="pre" fontSize="2xs" bg="transparent" color="inherit" border="none"
                          whiteSpace="pre-wrap" wordBreak="break-all" display="block">
                      {JSON.stringify(detailDevice, null, 2)}
                    </Code>
                  </Box>
                </Box>
              </VStack>
            ) : (
              <Text color="surface.subtle">No device selected.</Text>
            )}
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="surface.border">
            <Button variant="ghost" mr={3} onClick={deviceModal.onClose}>Close</Button>
            {detailDevice && (
              <Button leftIcon={<FiCopy />} onClick={() =>
                navigator.clipboard?.writeText(JSON.stringify(detailDevice, null, 2))
              }>
                Copy JSON
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
