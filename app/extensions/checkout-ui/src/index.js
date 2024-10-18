import {
    extend,
    BlockStack,
    Button,
    Heading,
    Text,
    useApi,
    useTranslate,
} from '@shopify/checkout-ui-extensions-react';

extend('Checkout::DeliveryAddress::RenderAfter', (root) => {
    const translate = useTranslate();
    const { delivery, shop } = useApi();

    root.appendChild(
        root.createComponent(
            BlockStack,
            {},
            [
                root.createComponent(Heading, {}, "Shippy Whippy Delivery"),
                root.createComponent(
                    Button,
                    {
                        onPress: async () => {
                            const deliveryGroups = await delivery.getDeliveryGroups();
                            const products = deliveryGroups.flatMap(group => group.deliveryOptions)
                                .flatMap(option => option.merchandise);

                            // Here you would implement the logic to calculate shipping based on product dimensions
                            // For now, we'll just log the products
                            console.log('Products:', products);

                            // You would then use the delivery.updateDeliveryOption() method to update the shipping option
                        },
                    },
                    "Calculate Shipping"
                ),
            ]
        )
    );

    return root;
});