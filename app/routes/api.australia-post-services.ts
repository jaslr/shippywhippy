import { json, type LoaderFunction } from '@remix-run/node';

interface Service {
  code: string;
  name: string;
  price: number;
}

const EXCLUDE_SMALL_SERVICE = process.env.EXCLUDE_SMALL_SERVICE !== 'false';

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const apiKey = url.searchParams.get('apiKey');

  if (!apiKey) {
    return json({ error: 'API key is required' }, { status: 400 });
  }

  try {
    const ausPostApiUrl = 'https://digitalapi.auspost.com.au/postage/parcel/domestic/service.json?from_postcode=2000&to_postcode=3000&length=10&width=10&height=10&weight=1';
    const ausPostResponse = await fetch(ausPostApiUrl, {
      headers: {
        'AUTH-KEY': apiKey,
      },
    });

    if (!ausPostResponse.ok) {
      throw new Error(`Australia Post API error: ${ausPostResponse.statusText}`);
    }

    const ausPostData = await ausPostResponse.json();
    let services: Service[] = ausPostData.services.service.map((service: any) => ({
      code: service.code,
      name: service.name,
      price: service.price,
    }));

    if (EXCLUDE_SMALL_SERVICE) {
      services = services.filter(service => service.name.toLowerCase() !== 'small');
    }

    return json({ services });
  } catch (error) {
    console.error('Error fetching Australia Post services:', error);
    return json({ error: 'Failed to fetch services' }, { status: 500 });
  }
};
