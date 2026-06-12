// components/ProvisioningOverview.js
//
// Manufacturing / provisioning overview — folded into the EMS dashboard from
// the old standalone MPS dashboard. Self-contained colours (literal hex /
// standard Chakra colorSchemes) so it renders correctly under the EMS theme
// without depending on MPS's custom semantic tokens.
//
// Reads the same admin provisioning APIs as the Provisioning page
// (getMacStats / listBatches / listProductModels) and polls every 30s.

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Flex, Grid, GridItem, HStack, VStack, Text, Heading, Icon,
  Progress, Tag, Spinner, Tooltip, Divider, SimpleGrid, Button, Badge,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FiPackage, FiActivity, FiArrowUpRight, FiHardDrive,
  FiWifi, FiRadio, FiZap, FiCpu,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { getMacStats, listBatches, listProductModels } from '../actions/provisioningActions';

// ── Palette (literal — independent of theme) ───────────────────
const C = {
  panel: 'white',
  panelAlt: '#F1F5F9',
  hover: '#F8FAFC',
  border: '#E2E8F0',
  borderHi: '#CBD5E1',
  strong: '#1E293B',
  muted: '#64748B',
  subtle: '#94A3B8',
  brand50: '#EEF2FF',
  brand300: '#A5B4FC',
  brand500: '#6366F1',
  brand600: '#4F46E5',
  brand700: '#4338CA',
  brand800: '#3730A3',
  success: '#10B981',
};

const MotionBox = motion(Box);
const fade = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

function Panel({ children, ...p }) {
  return (
    <MotionBox
      variants={fade}
      bg={C.panel}
      borderRadius="xl"
      border="1px solid"
      borderColor={C.border}
      boxShadow="sm"
      p={5}
      _hover={{ boxShadow: 'md' }}
      transition="box-shadow 0.15s ease"
      {...p}
    >
      {children}
    </MotionBox>
  );
}

function KPI({ icon: I, label, value, sub, badge }) {
  return (
    <Panel>
      <Flex justify="space-between" align="start" mb={4}>
        <Box
          w="40px" h="40px" borderRadius="lg"
          bg={C.brand50} color={C.brand600}
          display="flex" alignItems="center" justifyContent="center"
        >
          <Icon as={I} boxSize={4} />
        </Box>
        {badge && (
          <Tag size="sm" colorScheme="purple" variant="subtle">{badge}</Tag>
        )}
      </Flex>
      <Text fontSize="xs" color={C.muted} textTransform="uppercase" letterSpacing="0.08em" fontWeight={600} mb={2}>
        {label}
      </Text>
      <Text fontSize="3xl" fontWeight={700} color={C.strong} letterSpacing="-0.03em" lineHeight={1}>
        {value}
      </Text>
      {sub && <Text fontSize="xs" color={C.subtle} mt={2}>{sub}</Text>}
    </Panel>
  );
}

function MacDonut({ available, burned, assigned, untyped }) {
  const total = available + burned + assigned + untyped;
  if (!total) return null;
  const r = 72, cx = 90, cy = 90, c = 2 * Math.PI * r;
  let off = 0;
  const segs = [
    { v: available, color: '#6366F1', label: 'Ready'    },
    { v: untyped,   color: '#A5B4FC', label: 'Typeless' },
    { v: assigned,  color: '#F59E0B', label: 'Assigned' },
    { v: burned,    color: '#10B981', label: 'Burned'   },
  ].filter(s => s.v > 0);
  return (
    <Flex gap={6} align="center" wrap="wrap">
      <Box position="relative" w="180px" h="180px" flexShrink={0}>
        <svg width="180" height="180">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth="14" />
          {segs.map((s, i) => {
            const len = (s.v / total) * c;
            const node = (
              <circle key={i}
                cx={cx} cy={cy} r={r} fill="none"
                stroke={s.color} strokeWidth="14" strokeLinecap="round"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-off}
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
            );
            off += len;
            return node;
          })}
        </svg>
        <Box position="absolute" inset={0} display="flex" flexDir="column" alignItems="center" justifyContent="center">
          <Text fontSize="xs" color={C.subtle} textTransform="uppercase" letterSpacing="0.1em">Inventory</Text>
          <Text fontSize="2xl" fontWeight={700} color={C.strong} letterSpacing="-0.03em" lineHeight={1.1}>
            {total >= 1e6 ? `${(total / 1e6).toFixed(2)}M` : total.toLocaleString()}
          </Text>
          <Text fontSize="2xs" color={C.subtle} mt={1}>MAC addresses</Text>
        </Box>
      </Box>
      <VStack align="stretch" spacing={3} flex={1} minW="180px">
        {segs.map((s, i) => (
          <Box key={i}>
            <Flex justify="space-between" align="center" mb={1}>
              <HStack spacing={2}>
                <Box w="8px" h="8px" borderRadius="sm" bg={s.color} />
                <Text fontSize="sm" color={C.muted} fontWeight={500}>{s.label}</Text>
              </HStack>
              <Text fontSize="sm" fontWeight={600} color={C.strong} fontFamily="mono">
                {s.v.toLocaleString()}
              </Text>
            </Flex>
            <Box h="3px" w="100%" bg={C.panelAlt} borderRadius="full" overflow="hidden">
              <Box h="100%" bg={s.color} w={`${(s.v / total) * 100}%`}
                   transition="width 0.6s ease" borderRadius="full" />
            </Box>
          </Box>
        ))}
      </VStack>
    </Flex>
  );
}

// Per-type row in the "By Connection Type" panel.
// available = typed-available + typeless-available (claimable right now).
// We don't show a total/percentage because the typeless pool is shared across
// all three types — summing rows would triple-count.
function TypeBar({ icon: I, label, available, burned }) {
  return (
    <Flex py={3.5} justify="space-between" align="center">
      <HStack spacing={3}>
        <Box w="32px" h="32px" borderRadius="md" bg={C.brand50}
             display="flex" alignItems="center" justifyContent="center">
          <Icon as={I} color={C.brand600} boxSize={4} />
        </Box>
        <Box>
          <Text fontSize="sm" color={C.strong} fontWeight={600}>{label}</Text>
          <Text fontSize="2xs" color={C.subtle}>
            {burned > 0
              ? `${burned.toLocaleString()} already burned`
              : 'no devices shipped of this type yet'}
          </Text>
        </Box>
      </HStack>
      <VStack spacing={0} align="end">
        <Text fontSize="xl" fontWeight={700} color={C.strong} lineHeight={1} letterSpacing="-0.025em" fontFamily="mono">
          {available.toLocaleString()}
        </Text>
        <Text fontSize="2xs" color={C.success} fontWeight={700} letterSpacing="0.05em" textTransform="uppercase">
          ready to allocate
        </Text>
      </VStack>
    </Flex>
  );
}

const statusBadge = {
  generating:  { color: 'yellow', label: 'Generating' },
  ready:       { color: 'cyan',   label: 'Ready' },
  in_progress: { color: 'orange', label: 'In progress' },
  completed:   { color: 'green',  label: 'Completed' },
  failed:      { color: 'red',    label: 'Failed' },
  allocated:   { color: 'gray',   label: 'Allocated' },
  cancelled:   { color: 'gray',   label: 'Cancelled' },
};

export default function ProvisioningOverview() {
  const [loading, setLoading] = useState(true);
  const [macStats, setMacStats] = useState({ total: 0, byType: {} });
  const [batches, setBatches]   = useState([]);
  const [skus, setSkus]         = useState([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [m, b, s] = await Promise.all([getMacStats(), listBatches(), listProductModels()]);
      if (!alive) return;
      if (m?.byType) setMacStats(m);
      if (b?.batches) setBatches(b.batches);
      if (s?.models)  setSkus(s.models);
      setLoading(false);
    };
    load();
    const id = setInterval(load, 30_000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const totals = useMemo(() => {
    const sum = (s) => Object.values(macStats.byType || {}).reduce((a, t) => a + (t[s] || 0), 0);
    return {
      available: sum('available'),
      burned:    sum('burned'),
      assigned:  sum('assigned'),
      total:     macStats.total,
    };
  }, [macStats]);

  const untyped = macStats.byType?.null?.available || 0;
  const byType = (t) => {
    const o = macStats.byType?.[t] || {};
    return { available: (o.available || 0) + untyped, burned: o.burned || 0 };
  };

  const counts = batches.reduce((a, b) => {
    a.pending += (b.counts?.allocated || 0) + (b.counts?.provisioned || 0);
    a.batches += 1;
    return a;
  }, { pending: 0, batches: 0 });

  if (loading) {
    return (
      <Flex py={16} align="center" justify="center">
        <Spinner size="xl" color={C.brand500} thickness="3px" />
      </Flex>
    );
  }

  const availPct = ((totals.available / Math.max(totals.total, 1)) * 100).toFixed(1);

  return (
    <MotionBox
      initial="hidden" animate="show"
      variants={{ show: { transition: { staggerChildren: 0.04 } } }}
    >
      {/* Hero strip */}
      <MotionBox variants={fade} mb={6}>
        <Box
          position="relative"
          bgGradient={`linear(135deg, ${C.brand700} 0%, ${C.brand600} 50%, #6366F1 100%)`}
          borderRadius="2xl"
          p={{ base: 6, md: 7 }}
          color="white"
          overflow="hidden"
          boxShadow="lg"
        >
          <Box position="absolute" right="-60px" top="-60px" w="240px" h="240px" borderRadius="full"
               bg="white" opacity={0.08} filter="blur(2px)" />
          <Box position="absolute" right="120px" bottom="-80px" w="180px" h="180px" borderRadius="full"
               bg={C.brand300} opacity={0.25} filter="blur(20px)" />
          <Flex justify="space-between" align={{ base: 'start', md: 'center' }} flexDir={{ base: 'column', md: 'row' }} gap={4} position="relative">
            <Box>
              <HStack spacing={2} mb={2}>
                <Box w="6px" h="6px" borderRadius="full" bg="white" boxShadow="0 0 10px rgba(255,255,255,0.8)" />
                <Text fontSize="xs" color="white" textTransform="uppercase" letterSpacing="0.18em" fontWeight={700} opacity={0.95}>
                  Manufacturing Platform
                </Text>
              </HStack>
              <Heading size="lg" letterSpacing="-0.035em" color="white" lineHeight={1}>
                Provisioning
              </Heading>
              <Text color="whiteAlpha.900" mt={2} fontSize="sm">
                {batches.length} batches · {totals.total.toLocaleString()} MAC inventory · {skus.length} SKUs
              </Text>
            </Box>
            <HStack>
              <Link to="/provisioning">
                <Button bg="white" color={C.brand700} _hover={{ bg: 'whiteAlpha.900' }} rightIcon={<FiArrowUpRight />} size="md" boxShadow="md">
                  New batch
                </Button>
              </Link>
              <Link to="/certificates">
                <Button variant="outline" color="white" borderColor="whiteAlpha.500" _hover={{ bg: 'whiteAlpha.100', borderColor: 'white' }} size="md">
                  PKI
                </Button>
              </Link>
            </HStack>
          </Flex>
        </Box>
      </MotionBox>

      {/* KPI row */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={6}>
        <KPI icon={FiHardDrive} label="MAC pool" value={`${(totals.total / 1e6).toFixed(2)}M`}
             sub={`${totals.available.toLocaleString()} ready`} badge={`${availPct}% free`} />
        <KPI icon={FiZap} label="Burned" value={totals.burned.toLocaleString()} sub="Permanently allocated" />
        <KPI icon={FiPackage} label="SKU catalog" value={skus.length} sub="Active product models" />
        <KPI icon={FiActivity} label="Batches" value={counts.batches}
             sub={counts.pending ? `${counts.pending} in flight` : 'No active work orders'} />
      </SimpleGrid>

      {/* Charts row */}
      <Grid templateColumns={{ base: '1fr', lg: '1.4fr 1fr' }} gap={4} mb={6}>
        <GridItem>
          <Panel>
            <Flex justify="space-between" align="center" mb={5}>
              <Box>
                <Heading size="md">MAC Pool</Heading>
                <Text fontSize="xs" color={C.muted} mt={1}>Inventory composition across all states</Text>
              </Box>
              <Tag colorScheme="purple" variant="subtle" size="sm">Live</Tag>
            </Flex>
            <MacDonut
              available={totals.available - untyped}
              burned={totals.burned}
              assigned={totals.assigned}
              untyped={untyped}
            />
          </Panel>
        </GridItem>

        <GridItem>
          <Panel>
            <Box mb={3}>
              <Heading size="md">By Connection Type</Heading>
              <Text fontSize="xs" color={C.muted} mt={1}>Allocator-ready inventory</Text>
            </Box>
            <Divider borderColor={C.border} />
            <VStack spacing={0} align="stretch" divider={<Divider borderColor={C.border} />}>
              <TypeBar icon={FiCpu}   label="Ethernet" available={byType('Eth').available}  burned={byType('Eth').burned} />
              <TypeBar icon={FiWifi}  label="WiFi"     available={byType('WIFI').available} burned={byType('WIFI').burned} />
              <TypeBar icon={FiRadio} label="4G"       available={byType('4G').available}   burned={byType('4G').burned} />
            </VStack>
            <Box mt={3} px={3} py={2} bg={C.brand50} borderRadius="md" borderLeft="3px solid" borderColor={C.brand500}>
              <Text fontSize="2xs" color={C.brand800} lineHeight={1.6}>
                The same {untyped.toLocaleString()} typeless MACs are shared across all three types.
                Allocator stamps the type at claim time. Don't sum — pick the type you need.
              </Text>
            </Box>
          </Panel>
        </GridItem>
      </Grid>

      {/* Recent batches */}
      <Panel>
        <Flex justify="space-between" align="center" mb={4}>
          <Box>
            <Heading size="md">Recent batches</Heading>
            <Text fontSize="xs" color={C.muted} mt={1}>Last 5 work orders</Text>
          </Box>
          <Link to="/provisioning">
            <Button size="sm" variant="ghost" rightIcon={<FiArrowUpRight />}>View all</Button>
          </Link>
        </Flex>
        <Divider borderColor={C.border} mb={2} />
        {batches.length === 0 ? (
          <VStack py={12} spacing={3}>
            <Box w="56px" h="56px" borderRadius="2xl" bg={C.brand50}
                 display="flex" alignItems="center" justifyContent="center">
              <Icon as={FiPackage} boxSize={6} color={C.brand500} />
            </Box>
            <Text color={C.strong} fontWeight={500}>No batches yet</Text>
            <Text fontSize="xs" color={C.muted} textAlign="center" maxW="sm">
              Create your first batch to begin manufacturing. The IWON number from your ERP becomes the batch ID.
            </Text>
            <Link to="/provisioning"><Button size="sm" mt={2} colorScheme="purple">Create batch</Button></Link>
          </VStack>
        ) : (
          <VStack spacing={2} align="stretch">
            {batches.slice(0, 5).map((b) => {
              const meta = statusBadge[b.status] || statusBadge.allocated;
              const verifiedPct = ((b.counts?.verified || 0) / Math.max(b.count, 1)) * 100;
              return (
                <Link key={b.batchId} to="/provisioning" style={{ textDecoration: 'none' }}>
                  <Flex
                    px={4} py={3} borderRadius="lg"
                    bg="white" border="1px solid" borderColor={C.border}
                    _hover={{ bg: C.hover, borderColor: C.borderHi }}
                    align="center" justify="space-between" gap={4}
                    transition="all 0.15s"
                  >
                    <HStack spacing={3} flex={1} minW={0}>
                      <Box w="36px" h="36px" borderRadius="md" bg={C.brand50} color={C.brand600}
                           display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                        <Icon as={FiPackage} boxSize={4} />
                      </Box>
                      <Box flex={1} minW={0}>
                        <Text fontWeight={600} color={C.strong} fontSize="sm" isTruncated fontFamily="mono">
                          {b.batchId}
                        </Text>
                        <HStack spacing={2} mt={0.5}>
                          <Text fontSize="xs" color={C.muted}>{b.productModel}</Text>
                          <Text fontSize="xs" color={C.subtle}>·</Text>
                          <Text fontSize="xs" color={C.muted}>{b.count} devices</Text>
                          {b.connectionType && (
                            <>
                              <Text fontSize="xs" color={C.subtle}>·</Text>
                              <Tag size="sm" colorScheme="purple" variant="subtle">{b.connectionType}</Tag>
                            </>
                          )}
                        </HStack>
                      </Box>
                    </HStack>
                    <HStack spacing={4}>
                      <Tooltip label={`${b.counts?.verified || 0} verified · ${b.counts?.failed || 0} failed`}>
                        <Box minW="80px">
                          <Progress value={verifiedPct} size="xs" colorScheme="green" borderRadius="full" />
                          <Text fontSize="2xs" color={C.subtle} mt={1} textAlign="right" fontFamily="mono">
                            {b.counts?.verified || 0}/{b.count}
                          </Text>
                        </Box>
                      </Tooltip>
                      <Badge colorScheme={meta.color} variant="subtle" px={2.5} py={1} borderRadius="md">
                        {meta.label}
                      </Badge>
                    </HStack>
                  </Flex>
                </Link>
              );
            })}
          </VStack>
        )}
      </Panel>
    </MotionBox>
  );
}
