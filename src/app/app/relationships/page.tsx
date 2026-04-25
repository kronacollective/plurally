'use client';
import useAccount from "@/lib/hooks/useAccount"
import { useShortQuery } from "@/lib/hooks/useShortQuery"
import { useSupabase } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

const getContrastYIQ = (r: number, g: number, b: number) => {
  // const r = parseInt(hexcolor.substring(1,3),16);
  // const g = parseInt(hexcolor.substring(3,5),16);
  // const b = parseInt(hexcolor.substring(5,7),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? 'black' : 'white';
}

export default function RelationshipsPage() {
  const supabase = useSupabase();

  const { data: account } = useAccount();
  const { data: members } = useShortQuery(
    ['members', account?.id],
    async () => {
      // Get all members from account
      const { data: members } = await supabase
        .from('members')
        .select()
        .eq('account', account!.id)
        .eq('is_status', false);
      return members;
    }
  );
  const member_list = useMemo(() => {
    return members?.map(member => member.id);
  }, [members]);

  const { data: relationships } = useShortQuery(
    ['relationships', member_list],
    async () => {
      const { error, data: origin_relationships } = await supabase
        .from('relationships')
        .select('*,origin_member:members!origin_member(*),target_member:members!target_member(*)')
        .in('origin_member', member_list ?? []);
      if (error) console.error('relationships!', error);
      return origin_relationships;
    },
  );

  const nodes = useMemo(() => {
    const node_map: Record<string, Record<string, string>> = {};
    relationships?.forEach(rel => {
      // Create origin node
      if (rel.origin_type === 'member' || rel.origin_type === 'external' || rel.origin_member) {
        node_map[rel.origin_member?.id ?? ''] = {
          id: rel.origin_member?.id ?? '',
          name: rel.origin_member?.name ?? '',
          label: rel.origin_label ?? '',
          color: `rgba(${rel.origin_member?.color}, 80%)`,
        };
      } else if (rel.origin_type === 'arbitrary') {
        node_map[rel.origin_arbitrary ?? ''] = {
          id: rel.origin_arbitrary ?? '',
          name: rel.origin_arbitrary ?? '',
          label: rel.origin_label ?? '',
        };
      }
      // Create target node
      if (rel.target_type === 'member' || rel.target_type === 'external' || rel.target_member) {
        node_map[rel.target_member?.id ?? ''] = {
          id: rel.target_member?.id ?? '',
          name: rel.target_member?.name ?? '',
          label: rel.target_label ?? '',
          color: `rgba(${rel.target_member?.color}, 80%)`,
        };
      } else if (rel.target_type === 'arbitrary') {
        node_map[rel.target_arbitrary ?? ''] = {
          id: rel.target_arbitrary ?? '',
          name: rel.target_arbitrary ?? '',
          label: rel.target_label ?? '',
        };
      }
    });
    console.log('nodes', node_map);
    return Object.values(node_map);
  }, [relationships]);

  const links = useMemo(() => {
    const rel_map: Record<string, Record<string, string | number>> = {};
    relationships?.forEach(rel => {
      rel_map[rel.id] = {
        source: (rel.origin_type === 'member' || rel.origin_type === 'external' || rel.origin_member ? rel.origin_member?.id : rel.origin_arbitrary) ?? '',
        target: (rel.target_type === 'member' || rel.target_type === 'external' || rel.target_member ? rel.target_member?.id : rel.target_arbitrary) ?? '',
        label: rel.label ?? '',
        value: 1,
      }
    });
    console.log('links', rel_map);
    return Object.values(rel_map);
  }, [relationships]);

  return (
    <>
      <ForceGraph2D
        graphData={{ nodes, links }}
        linkLabel="label"
        linkWidth={10}
        nodeLabel="label"
        nodeCanvasObject={(node, ctx, global_scale) => {
          const font_size = 20/global_scale;
          ctx.font = `${font_size}px sans-serif`;
          const text_width = ctx.measureText(node.name).width;
          const bg_dimensions = [text_width, font_size].map(n => n + font_size * 0.4); // padding

          ctx.fillStyle = node.color ?? 'rgba(0, 0, 0, 80%)';
          ctx.beginPath();
          // @ts-expect-error: doing this according to example code
          ctx.roundRect(node.x - bg_dimensions[0] / 2, node.y - bg_dimensions[1] / 2, ...bg_dimensions, 5);
          ctx.fill();
          // ctx.fillRect(node.x - bg_dimensions[0] / 2, node.y - bg_dimensions[1] / 2, ...bg_dimensions);

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const rgb = node.color?.match(/rgba\((\d+), (\d+), (\d+), \d+%\)/)?.slice(1) ?? [0,0,0];
          ctx.fillStyle = getContrastYIQ(rgb[0], rgb[1], rgb[2]);
          // @ts-expect-error: doing this according to example code
          ctx.fillText(node.name, node.x, node.y);

          node.__bg_dimensions = bg_dimensions;
        }}
      />
    </>
  )
}