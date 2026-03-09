import { MutationFunction, QueryFunction, QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Unionize } from "@/lib/types/Unionize";

export const useShortQuery = <R>(key: QueryKey, fn: QueryFunction<R>, depends?: any[]) => {
  return useQuery({
    queryKey: key,
    queryFn: fn,
    ...(!depends ? {} : {
      enabled: depends.every(a => !!a),
    })
  });
};

export const useShortMutation = (key: QueryKey, fn: MutationFunction) => {
  const query_client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSettled: () => query_client.invalidateQueries({ queryKey: key }),
  });
};

type Mutators = {
  [Mutator: string]: (...args: unknown[]) => void,
};

// export const useShortMutations = <T extends Mutators>(key: QueryKey, fns: T) => {
//   const query_client = useQueryClient();
//
//   const mutation_types = Object.keys(fns);
//   const mutation = useMutation({
//     mutationFn: ({type, args}: {type: keyof T, args: Parameters<Unionize<T>>}) => {
//       if (!mutation_types.includes(String(type))) return;
//       const fn = fns[type];
//       return fn(...args);
//     },
//     onSettled: () => query_client.invalidateQueries({ queryKey: key }),
//   });
//
//   return Object.fromEntries(
//     mutation_types.map(
//       (type: keyof T) =>
//         [type, (...args: Parameters<T[keyof T]>) => {
//           console.log('mutation-fn', args);
//           mutation.mutateAsync({type, args});
//         }]
//     )
//   );
// }

export const useShortMutations = <T extends Mutators>(key: QueryKey, fns: T) => {
  const query_client = useQueryClient();

  const mutation_types: Array<keyof T> = Object.keys(fns);
  type MutationParameters = { type: keyof T, args: Parameters<Unionize<T>> };
  const mutation = useMutation<void, Error, MutationParameters>({
    mutationFn: async ({type, args}: MutationParameters) => {
      if (!mutation_types.includes(String(type))) return;
      const fn = fns[type];
      return fn(...args);
    },
    onSettled: () => query_client.invalidateQueries({ queryKey: key }),
  });

  const mutators = Object.fromEntries(
    mutation_types.map(
      (type) => {
        return [type, (...args: Parameters<Unionize<T>>) => {
          console.log('mutation-fn', args);
          mutation.mutateAsync({ type, args });
        }]
      }
    )
  ) as T;

  return {
    ...mutators,
    invalidateCache: () => query_client.invalidateQueries({ queryKey: key }),
  }
}
