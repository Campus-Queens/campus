import React, { useState, useEffect } from 'react';
import API from '../axios';

useEffect(() => {
    const fetchListings = async () => {
        try {
            const response = await API.get('api/listings/', {
                params: {
                    limit: 8,
                    ordering: '-created_at'
                }
            });
            setListings(response.data.results);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching listings:', err);
            setError(err.response?.data?.detail || 'Failed to load listings');
            setLoading(false);
        }
    };

    fetchListings();
}, []);

useEffect(() => {
    const fetchCategories = async () => {
        try {
            const response = await API.get('api/categories/');
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    fetchCategories();
}, []); 