'use client'

import dynamic from "next/dynamic";
import { useMemo } from "react";
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

const getContrastYIQ = (r: number, g: number, b: number) => {
  // const r = parseInt(hexcolor.substring(1,3),16);
  // const g = parseInt(hexcolor.substring(3,5),16);
  // const b = parseInt(hexcolor.substring(5,7),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? 'black' : 'white';
};

export default function RelationshipMap() {
  const aqua = useMemo(() => ({
    "idx": 31, "id": "hA0c3VU-BjMbdazqPYwWV", "name": "🌟Aqua", "pronouns": "He/him", "avatar": "https://myrssvqfvsuovxsqdlfi.supabase.co/storage/v1/object/public/avatars/hA0c3VU-BjMbdazqPYwWV-1774981650921.jpg", "color": "23, 255, 244", "banner": "https://myrssvqfvsuovxsqdlfi.supabase.co/storage/v1/object/public/banners/hA0c3VU-BjMbdazqPYwWV-1777045192356.jpg", "roles": ["introject", "pseudo-host"]
  }), []);
  const ruby = useMemo(() => ({
    "idx":47,"id":"uhxeVFRkdqK-wKO7cIenZ","created_at":"2026-03-26 14:50:19.90541+00","name":"‧˚꒰  💫 ꒱    ruby!    ໒꒱ᵎᵎ","pronouns":"ᯓᰔᩚ    her   ⸝⸝   it","description":"trying out it/its!,!!!","avatar":null,"color":"255, 182, 232","is_status":false,"archived":false,"member_of":null,"username":null,"unlisted":false,"banner":null,"roles":null
  }), []);
  const relationships = useMemo(() => [
    {"idx":6,"id":"bee46c57-7302-4b2a-b0d0-d5aaa986a92d","directional":false,"origin_arbitrary":null,"origin_member": aqua ,"origin_label":"Brother","target_arbitrary":"Ruby","target_member": ruby,"target_label":"Sister","type":null,"label":"siblings with","origin_type":null,"target_type":"external"},
    {"idx":7,"id":"c98e1374-c4b8-4de6-a12c-6f7fba108046","directional":false,"origin_arbitrary":null,"origin_member": aqua ,"origin_label":"Son","target_arbitrary":"Ai","target_member":null,"target_label":"Mom","type":null,"label":"son of","origin_type":null,"target_type":"arbitrary"},
  ], [aqua, ruby]);
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
        width={500}
        height={250}
        linkLabel="label"
        linkWidth={10}
        linkColor={() => "rgba(255, 255, 255, 35%)"}
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