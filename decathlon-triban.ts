import { sprintf } from "https://deno.land/std@0.100.0/fmt/printf.ts";
import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";

try {
  Deno.lstatSync('.env');
  config({ export: true });
} catch (err) { }

const sleep = function(ms: number) {
  return new Promise(resolve => setInterval(resolve, ms));
}

const checkProduct = async function(): Promise<void> {
  const url = 'https://www.decathlon.cz/cz/getAsyncProductData.json';

  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");

  const body = new URLSearchParams();
  body.append("productId", "8575940");

  const requestOptions = {
    method: 'POST',
    headers: headers,
    body: body,
  };

  interface Product {
    onlineStock: number,
    storeStock: number | null
    modelId: string,
    brandName: string,
    productName: string,
    label: string,
    storePrice: number,
  }

  try {
    const res = await fetch(url, requestOptions);
    const products: Array<Product> = await res.json();
    
    const onlineStockFound = products.map(product => product.onlineStock).find(onlineStock => onlineStock > 0);
    const storeStockFound = products.map(product => product.storeStock).find(storeStock => storeStock !== null && storeStock > 0);
    const isForSale = (onlineStockFound !== undefined || storeStockFound !== undefined);
    
    const formated = products.map((product) => {
      return sprintf(
        "%s %-5s %dks %dks %dCZK",
        product.brandName,
        product.label,
        product.onlineStock,
        product.storeStock,
        product.storePrice,
      );
    });

    let mention = "";
    if (isForSale) {
      mention = "<@tomas.kubat>";
    }

    const slackMessage = {
      text: `${mention}\`\`\`${formated.join("\n")}\`\`\``,
      mrkdwn: true,
    };
    console.log(slackMessage);

    const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL') as string;
    console.log(SLACK_WEBHOOK_URL);

    fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage)
    });
  } catch(error) {
    console.error(error);
  }
}

const loop = async function(intervalSeconds: number): Promise<void> {
  for (;;) {
    checkProduct();
    await sleep(intervalSeconds * 1000);
  }
}

await loop(10);
