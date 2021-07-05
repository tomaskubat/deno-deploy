import { sprintf } from "https://deno.land/std@0.100.0/fmt/printf.ts";
import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";
import { Application, Context, Router } from "https://deno.land/x/oak@v7.5.0/mod.ts";
import { fsExistsSync, sendSlackMessage } from "https://raw.githubusercontent.com/sandbox-space/deno-helpers/main/mod.ts";

if (fsExistsSync('.env.decathlon')) {
  config({ 
    export: true,
    path: '.env.decathlon',
  });
}

const checkProduct = async function(context: Context): Promise<void> {
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

    context.response.body = products.map(product => {
      return {
        brandName: product.brandName,
        label: product.label,
        onlineStock: product.onlineStock,
        storeStock: product.storeStock,
        storePrice: product.storePrice,
      }
    });
    console.log(context.response.body);

    const productSizeL = products.filter(product => product.label == 'L');
    const onlineStockFound = productSizeL.map(product => product.onlineStock).find(onlineStock => onlineStock > 0);
    const storeStockFound = productSizeL.map(product => product.storeStock).find(storeStock => storeStock !== null && storeStock > 0);
    const isForSale = (onlineStockFound !== undefined || storeStockFound !== undefined);
    
    if (!isForSale) {
      return;
    }

    const mention = "<@tomas.kubat>";
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
    const slackMessage = `${mention}\`\`\`${formated.join("\n")}\`\`\``;
    const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL') as string;
    console.log(SLACK_WEBHOOK_URL);
    console.log(slackMessage);
    sendSlackMessage(SLACK_WEBHOOK_URL, slackMessage);
  } catch(error) {
    console.error(error);
  }
}

const router = new Router();
router
  .get("/decathlon-triban", checkProduct);

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

// Deno Deploy
addEventListener("fetch", app.fetchEventHandler());

// Deno Cli
//await app.listen({ port: 8080 });

// Infinite loop
//await loop(5, checkProduct);
