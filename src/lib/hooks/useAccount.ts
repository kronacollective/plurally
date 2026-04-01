import { useSupabase } from "../supabase/client";
import { useShortQuery } from "./useShortQuery";

export default function useAccount() {
  const supabase = useSupabase();
  const data = useShortQuery(
    ["account"],
    async () => {
      const { data: user } = await supabase.auth.getUser();
      const { data: account } = await supabase
        .from('accounts')
        .select()
        .eq('user', user.user!.id)
        .single();
      return account;
    },
  );
  return data;
}