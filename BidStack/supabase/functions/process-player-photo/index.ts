import { serve } from "https://deno.land/std/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {

  const body = await req.json()
  const record = body.record

  const playerId = record.id
  const photoUrl = record.photo_url

  if (!photoUrl) {
    return new Response("No photo provided")
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  // Start prediction
  const start = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("REPLICATE_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "MODEL_VERSION",
      input: {
        image: photoUrl,
        prompt: "Convert this cricket player photo into esports avatar with dramatic lighting, dark background, ultra sharp portrait, cinematic lighting, epic background, epic lighting"
      }
    })
  })

  const prediction = await start.json()

  const predictionId = prediction.id

  // Poll until finished
  let result = prediction

  while (result.status !== "succeeded" && result.status !== "failed") {

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const check = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get("REPLICATE_API_KEY")}`,
        }
      }
    )

    result = await check.json()
  }

  if (result.status === "failed") {
    return new Response("Prediction failed")
  }

  const generatedImage = result.output[0]

  const image = await fetch(generatedImage)
  const buffer = await image.arrayBuffer()

  const filePath = `processed/player_${playerId}.png`

  await supabase.storage
    .from("player-photos")
    .upload(filePath, buffer, {
      contentType: "image/png",
      upsert: true
    })

  const publicUrl =
    `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/player-photos/${filePath}`

  await supabase
    .from("players")
    .update({
      processed_photo_url: publicUrl
    })
    .eq("id", playerId)

  return new Response("Success")
})