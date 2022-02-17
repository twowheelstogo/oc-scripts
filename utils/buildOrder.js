module.exports.buildOrder = (order) => {

    // const cleanedMetafields = (meta) => ({
    //     name: meta.key,
    //     value: `${JSON.parse(meta.value).title} x ${JSON.parse(meta.value).quantity}`
    // });

    const cleanedMetafields = (metafields) => {
        const items = [];
        (metafields || []).forEach((item, index) => {
            const bundleItems = JSON.parse(item.value) || [];
            bundleItems.forEach((bundleItem) => {
                items.push({
                    ...bundleItem,
                    boxId: index + 1
                });
            });
        });

        return items.map((item, index) => ({
            name: `${index}`,
            value: `${item.title} x ${item.quantity}: box #${item.boxId}`
        }));
    }

    const cleanedItems = Array.isArray(order.shipping) && (order.shipping[0].items || []).map((item) => {
        return {
            id: item._id,
            productId: item._id,
            name: Array.isArray(item.attributes) && item.attributes.length > 0 && `${item.title} - ${item.attributes[0].value}`,
            quantity: item.quantity,
            price: item.price.amount,
            properties: cleanedMetafields(item.metafields || [])
            // properties: (item.metafields || []).map((metafields) => cleanedMetafields(metafields))
        };
    });

    console.log('account', order.account);
    console.log("address", order.shipping[0].address)

    const cleanedBilling = {
        first_name: (order.account?.profile && order.account.profile.firstName) || "",
        last_name: (order.account?.profile && order.account.profile.lastName) || "",
        address1: order.billing && order.billing?.address || "",
        address2: "",
        city: order.billing && order.billing?.nit || "cf",
        state: "",
        latitude: order.shipping[0].address?.geolocation?.latitude || 0,
        longitude: order.shipping[0].address?.geolocation?.longitude || 0,
        phone: ""
    }

    const cleanedShipping = {
        first_name: (order.giftNote?.receiver) || (order.account?.profile && order.account.profile.firstName) || "",
        last_name: (order.giftNote?.receiver ? "" : (order.account?.profile && order.account.profile.lastName)) || "",
        address1: order.shipping[0].address?.address || "",
        address2: order.shipping[0].address?.reference || "",
        city: "",
        state: "",
        latitude: order.shipping[0].address?.geolocation?.latitude || 0,
        longitude: order.shipping[0].address?.geolocation?.longitude || 0,
        phone: (order.account?.profile && order.account.profile.phone) || ""
    };

    const cleanedTotal = {
        shop_money: {
            amount: order.shipping[0].invoice.total
        }
    };

    const cleanedShippingTotal = {
        shop_money: {
            amount: order.shipping[0].invoice.shipping
        }
    };

    const buildDate = (datetime) => {
        const date = new Date(datetime);
        return date.getDate();
    };

    const buildTime = (datetime) => {
        const date = new Date(datetime);
        return date.getTime();
    };

    const cleanedMetadata = [
        {
            "name": "pickupDate",
            "value": order.shipping[0].pickupDetails?.datetime || null
        },
        {
            "name": "pickupTime",
            "value": null
        },
        {
            "name": "deliveryDate",
            "value": ""
        },
        {
            "name": "deliveryTime",
            "value": ""
        },
        {
            "name": "giftFrom",
            "value": order.giftNote?.sender || ""
        },
        {
            "name": "giftTo",
            "value": order.giftNote?.receiver || ""
        },
        {
            "name": "giftNote",
            "value": order.giftNote?.message || ""
        }
    ];

    const cleanedShippingLines = [
        {
            title: order.shipping[0]?.shipmentMethod?.label || null
        }
    ];

    const cleanedBranchOffice = order.shipping[0].type == "shipping"
        ? (order.shipping[0].address.metaddress.distance?.branchId || null)
        : (order.shipping[0].pickupDetails?.branchId || null)

    return {
        id: order._id,
        order_number: order.orderId,
        line_items: cleanedItems,
        billing_address: cleanedBilling,
        shipping_address: cleanedShipping,
        note: (order.notes && order.notes[0]?.content) || "",
        total_price_set: cleanedTotal,
        total_shipping_price_set: cleanedShippingTotal,
        email: order.email || "",
        note_attributes: cleanedMetadata,
        shipping_lines: cleanedShippingLines,
        shipping_type: order.shipping[0].type,
        branch_id: cleanedBranchOffice
    };;
}