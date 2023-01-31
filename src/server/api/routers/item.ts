import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const ItemSchema = z.object({
  shop: z.string().trim(),
  item_name: z.string().trim(),
  item_price: z.preprocess(Number, z.number()),
  item_discount: z.preprocess(Number, z.number()).default(0),
  volume: z.preprocess(Number, z.number()).default(0),
  weight: z.preprocess(Number, z.number()).default(0),
  bought_at: z.preprocess(arg => new Date(arg as string), z.date()),
})

export type ItemType = z.infer<typeof ItemSchema>;

export const itemRouter = createTRPCRouter({
  getAll: publicProcedure.input(z.string().optional()).query(async ({ input, ctx }) => {
    const trimmed = input?.trim()
    const total = await ctx.prisma.item.findMany({
      orderBy: { created_at: "desc" },
      where: {
        item_name: {
          contains: trimmed,
          mode: "insensitive"
        }
      }
    })
    const items = trimmed === "" ? await ctx.prisma.item.findMany({
      take: 100,
      orderBy: { created_at: "desc" }
    }) : await ctx.prisma.item.findMany({
      take: 100,
      orderBy: { created_at: "desc" },
      where: {
        item_name: {
          contains: trimmed,
          mode: "insensitive"
        }
      }
    })

    return {
      items,
      total: total.reduce((t, i) => t + i.item_price, 0)
    }
  }),
  create: publicProcedure
    .input(z.array(ItemSchema))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.item.createMany({
        data: input
      })
    })
});
